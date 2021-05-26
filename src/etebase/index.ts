import * as Etebase from "etebase";
import { Account, Collection, Item } from "etebase";
import { User } from "@/services/user/interfaces";
import { Annotations } from "@gliff-ai/annotate";
import { Gallery, Image, Slices } from "./interfaces";

declare const STORE_URL: string;
const SERVER_URL = `${STORE_URL}etebase`;
export const API_URL = `${STORE_URL}django/api`;

export class DominateEtebase {
  etebaseInstance: Account;

  collections: Collection[];

  collectionsMeta: Gallery[];

  public isLoggedIn: boolean;

  constructor() {
    this.collections = [];
    this.collectionsMeta = [];
    this.isLoggedIn = false;
  }

  getUser = (): null | User => {
    if (this.etebaseInstance?.user?.username) {
      return {
        username: this.etebaseInstance.user.username,
        authToken: this.etebaseInstance.authToken,
      };
    }

    return null;
  };

  init = async (): Promise<null | User> => {
    const savedSession = localStorage.getItem("etebaseInstance");
    if (savedSession) {
      this.etebaseInstance = await Etebase.Account.restore(savedSession);

      this.isLoggedIn = !!this.etebaseInstance?.user?.username;
      return {
        username: this.etebaseInstance.user.username,
        authToken: this.etebaseInstance.authToken,
      };
    }

    this.isLoggedIn = false;
    return null;
  };

  login = async (username: string, password: string): Promise<User> => {
    await this.init();

    if (!this.isLoggedIn) {
      this.etebaseInstance = await Etebase.Account.login(
        username,
        password,
        SERVER_URL
      );

      const newSession = await this.etebaseInstance.save();

      // TODO: encrypt this!
      localStorage.setItem("etebaseInstance", newSession);
    }
    this.isLoggedIn = true;

    return {
      username: this.etebaseInstance.user.username,
      authToken: this.etebaseInstance.authToken,
    };
  };

  signup = async (email: string, password: string): Promise<User> => {
    this.etebaseInstance = await Etebase.Account.signup(
      {
        username: Etebase.toBase64(email),
        email,
      },
      password,
      SERVER_URL
    );

    const newSession = await this.etebaseInstance.save();

    // TODO: encrypt this!
    localStorage.setItem("etebaseInstance", newSession);

    this.isLoggedIn = true;

    return {
      username: this.etebaseInstance.user.username,
      authToken: this.etebaseInstance.authToken,
    };
  };

  logout = async (): Promise<boolean> => {
    await this.etebaseInstance.logout();
    localStorage.removeItem("etebaseInstance");
    this.isLoggedIn = false;
    return true;
  };

  wrangleGallery = (col: Collection): Gallery => {
    const meta = col.getMeta();
    const modifiedTime = meta.mtime;
    delete meta.mtime;

    return {
      ...meta,
      modifiedTime,
      type: "gliff.gallery",
      uid: col.uid,
    } as Gallery;
  };

  wrangleImageMeta = (item: Item): Image => {
    const meta = item.getMeta();
    const modifiedTime = meta.mtime;
    delete meta.mtime;

    return {
      ...meta,
      modifiedTime,
      type: "gliff.image",
      uid: item.uid,
    } as Image;
  };

  getCollectionsMeta = async (type = "gliff.gallery"): Promise<Gallery[]> => {
    if (this.collections.length > 0) return this.collectionsMeta;

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const { data } = await collectionManager.list(type);
    this.collectionsMeta = data.map(this.wrangleGallery);
    return this.collectionsMeta;
  };

  getItemManager = async (collectionId: string): Promise<any> => {
    if (!this.etebaseInstance) throw new Error("No etebase instance");
    const collectionManager = this.etebaseInstance.getCollectionManager();

    const collection = await collectionManager.fetch(collectionId);
    return collectionManager.getItemManager(collection);
  };

  getImagesMeta = async (collectionId: string): Promise<any> => {
    const itemManager = await this.getItemManager(collectionId).catch((e) => {
      console.log(e);
    });
    const { data } = await itemManager.list();
    console.log(data[0].getContent(Etebase.OutputFormat.String));

    return data.map(this.wrangleImageMeta);
  };

  getImage = async (collectionId: string, itemUid: string): Promise<Image> => {
    const itemManager = await this.getItemManager(collectionId).catch((e) => {
      console.log(e);
    });
    return await itemManager.fetch(itemUid);
  };

  getAnnotationItems = async (
    collectionId: string,
    imageUid: string
  ): Promise<Item[]> => {
    const itemManager = await this.getItemManager(collectionId).catch((e) => {
      console.log(e);
    });
    const { data } = await itemManager.list();

    return data.filter((item) => {
      const meta = item.getMeta();
      return meta.imageUid === imageUid;
    });
  };

  createAnnotation = async (
    collectionId: string,
    imageUid: string,
    annotationsObject: Annotations
  ): Promise<void> => {
    // Store annotations object in a new item.

    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionId).catch((e) => {
      console.log(e);
    });

    // Create new item
    const createdTime = new Date().getTime();
    const item = await itemManager.create(
      {
        type: "gliff.annotation",
        imageUid: imageUid,
        createdTime: createdTime,
        modifiedTime: createdTime,
        labels: [],
      },
      JSON.stringify(annotationsObject)
    );

    // Store item inside its own collection
    await itemManager.batch([item]);
  };

  updateAnnotation = async (
    collectionId: string,
    item: Item,
    annotationsObject: Annotations
  ): Promise<void> => {
    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionId).catch((e) => {
      console.log(e);
    });

    // Update item's content and meta
    const modifiedTime = new Date().getTime();
    item.setMeta({ ...item.getMeta(), modifiedTime });
    item.setContent(JSON.stringify(annotationsObject));

    await itemManager.batch([item]);
  };

  createCollection = async (name: string): Promise<string> => {
    if (!this.etebaseInstance) throw new Error("No etebase instance");
    const collectionManager = this.etebaseInstance.getCollectionManager();

    // Create, encrypt and upload a new collection
    const collection = await collectionManager.create(
      "gliff.gallery",
      {
        name,
      },
      ""
    );
    await collectionManager.upload(collection);
    return collection.uid;
  };

  createImage = async (
    collectionId: string,
    slicesData: Slices
  ): Promise<void> => {
    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionId).catch((e) =>
      console.log(e)
    );

    // Create new image item
    const createdTime = new Date().getTime();
    const item = await itemManager.create(
      {
        type: "gliff.image",
        createdTime: createdTime,
        modifiedTime: createdTime,
      },
      "some string"
    );
    console.log(item.getMeta());
    console.log(item.getContent(Etebase.OutputFormat.String));

    // Store item inside its own collection
    await itemManager.batch([item]);
  };
}

export { Collection, Item, Gallery, Image };
