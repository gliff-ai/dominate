import * as Etebase from "etebase";
import { Account, Collection, Item } from "etebase";
import {Gallery, Image, Thumbnail} from "./interfaces";

const SERVER_URL = "http://glifftempdeploy3.westeurope.azurecontainer.io:8033/";

export class DominateEtebase {
  etebaseInstance: Account;

  collections: Collection[];

  collectionsMeta: Gallery[];

  loggedIn: boolean;

  constructor() {
    this.collections = [];
    this.collectionsMeta = [];
  }

  login = async (username: string, password: string): Promise<boolean> => {
    const savedSession = localStorage.getItem("etebaseInstance");

    if (!savedSession) {
      this.etebaseInstance = await Etebase.Account.login(
        username,
        password,
        SERVER_URL
      );

      const newSession = await this.etebaseInstance.save();

      // TODO: encrypt this!
      localStorage.setItem("etebaseInstance", newSession);
    } else {
      this.etebaseInstance = await Etebase.Account.restore(savedSession);
    }

    this.loggedIn = true;

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

  wrangleImage = (item: Item): Image => {
    const meta = item.getMeta();
    const modifiedTime = meta.mtime;
    delete meta.mtime;

    return {
      ...meta,
      modifiedTime,
      type: "gliff.image",
      uid: item.uid,
    } as Image;
  }

  getImagesMeta = async (collectionId: string): Promise<any> => {
    if (!this.etebaseInstance) throw new Error("No etebase instance");
    const collectionManager = this.etebaseInstance.getCollectionManager();

    const collection = await collectionManager.fetch(collectionId);
    const itemManager = collectionManager.getItemManager(collection);
    const { data } = await itemManager.list();
    console.log(data);

    return data.map(this.wrangleImage);
  };

  getCollectionsMeta = async (type = "gliff.gallery"): Promise<Gallery[]> => {
    if (this.collections.length > 0) return this.collectionsMeta;

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const { data } = await collectionManager.list(type);
    this.collectionsMeta = data.map(this.wrangleGallery);
    return this.collectionsMeta;
  };
}

export { Collection, Item, Gallery };
