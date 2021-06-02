import * as Etebase from "etebase";
import { Account, Collection, Item, ItemManager } from "etebase";
import { Annotations } from "@gliff-ai/annotate/dist/src/annotation";
import { User } from "@/services/user/interfaces";
import { Gallery, Image, ImageMeta, Annotation } from "./interfaces";

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

  wrangleImage = async (item: Item): Promise<Image> => {
    const meta = item.getMeta();
    const content = await item.getContent(Etebase.OutputFormat.String);

    return {
      type: "gliff.image",
      uid: item.uid,
      ...meta,
      content,
    } as Image;
  };

  getImagesMeta = async (collectionUid: string): Promise<Image[]> => {
    if (!this.etebaseInstance) throw new Error("No etebase instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const collection = await collectionManager.fetch(collectionUid);
    const itemManager = collectionManager.getItemManager(collection);
    const items = await itemManager.list();
    return Promise.all(items.data.map(this.wrangleImage));
  };

  getCollectionsMeta = async (type = "gliff.gallery"): Promise<Gallery[]> => {
    if (this.collections.length > 0) return this.collectionsMeta;
    if (!this.etebaseInstance) throw new Error("No etebase instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const { data } = await collectionManager.list(type);
    this.collectionsMeta = data.map(this.wrangleGallery);
    return this.collectionsMeta;
  };

  createCollection = async (name: string): Promise<void> => {
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
  };

  getItemManager = async (collectionUid: string): Promise<ItemManager> => {
    if (!this.etebaseInstance) throw new Error("No etebase instance");
    const collectionManager = this.etebaseInstance.getCollectionManager();

    const collection = await collectionManager.fetch(collectionUid);
    return collectionManager.getItemManager(collection);
  };

  createImage = async (
    collectionUid: string,
    imageMeta: ImageMeta,
    imageContent: string | Uint8Array
  ): Promise<void> => {
    try {
      const createdTime = new Date().getTime();
      // Retrieve itemManager
      const itemManager = await this.getItemManager(collectionUid);

      // Create new image item and add it to the collection
      const item = await itemManager.create(
        {
          type: "gliff.image",
          createdTime,
          modifiedTime: createdTime,
          meta: imageMeta,
        },
        imageContent
      );
      await itemManager.batch([item]);
    } catch (e) {
      console.error(e);
    }
  };

  wrangleAnnotations = async (item: Item): Promise<Annotation> => {
    const meta = item.getMeta();
    const content = await item.getContent(Etebase.OutputFormat.String);
    return {
      ...meta,
      content,
    } as Annotation;
  };

  getAnnotations = async (
    collectionUid: string,
    imageUid: string
  ): Promise<Annotation[]> => {
    const itemManager = await this.getItemManager(collectionUid);

    const { data } = await itemManager.list();

    return Promise.all(
      data
        .filter((item) => {
          const meta = item.getMeta() as Annotation;
          return meta.type === "gliff.annotation" && meta.imageUid === imageUid;
        })
        .map(this.wrangleAnnotations)
    );
  };

  createAnnotation = async (
    collectionUid: string,
    imageUid: string,
    annotationsObject: Annotations
  ): Promise<void> => {
    // Store annotations object in a new item.

    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionUid);

    // Create new item
    const createdTime = new Date().getTime();
    const item = await itemManager.create(
      {
        type: "gliff.annotation",
        imageUid,
        createdTime,
        modifiedTime: createdTime,
        labels: [],
      },
      JSON.stringify(annotationsObject)
    );

    // Store item inside its own collection
    await itemManager.batch([item]);
  };

  updateAnnotation = async (
    collectionUid: string,
    annotationUid: string,
    annotationsObject: Annotations
  ): Promise<void> => {
    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionUid);
    const item = await itemManager.fetch(annotationUid);

    // Update item's content and modified time
    const modifiedTime = new Date().getTime();
    const meta = item.getMeta() as Annotation;
    delete meta.modifiedTime;

    item.setMeta({ ...meta, modifiedTime });
    await item.setContent(JSON.stringify(annotationsObject));

    // Save changes
    await itemManager.batch([item]);
  };

  getItem = async (collectionUid: string, itemUid: string): Promise<Item> => {
    // Retrieve item from a collection.
    const itemManager = await this.getItemManager(collectionUid);
    const item = await itemManager.fetch(itemUid);
    return item;
  };

  getImage = async (collectionUid: string, itemUid: string): Promise<Image> => {
    // Retrieve image item from a collection.
    const item = await this.getItem(collectionUid, itemUid);
    const content = await item.getContent(Etebase.OutputFormat.String);
    return {
      ...item.getMeta(),
      type: "gliff.image",
      uid: item.uid,
      content,
    } as Image;
  };
}

export { Collection, Item, Gallery, Image };
