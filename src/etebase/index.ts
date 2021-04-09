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
    this.etebaseInstance = await Etebase.Account.login(
      username,
      password,
      SERVER_URL
    );

    console.log("Logged in!!!");

    this.loggedIn = true;
    return true;
  };

  wrangleGallery = (col: Collection): Gallery =>
    {
      const meta = col.getMeta();
      const modifiedTime = meta.mtime;
      delete meta.mtime;

      return { ...meta, modifiedTime, type: "gliff.gallery", uid: col.uid } as Gallery;
    }


  // getCollection = async (id): Promise<{gallery: Gallery, items: (Thumbnail | Image)[]}> => {
  //   //"29NUvKIzxUVmTXpqxtI5GLiB4TNbPcEi"
  //   if (!this.etebaseInstance) throw new Error("No etebase instance");
  //
  //   const collectionManager = this.etebaseInstance.getCollectionManager();
  //   const collection = await collectionManager.fetch(id);
  //
  //   const itemManager = collectionManager.getItemManager(collection);
  //
  //   const items = await itemManager.list();
  //   console.log(items);
  //   return {gallery: this.wrangleGallery(collection), items};
  // };

  getCollectionsMeta = async (type = "gliff.gallery"): Promise<Gallery[]> => {
    if (!this.etebaseInstance) throw new Error("No etebase instance");

    if (this.collections.length > 0) return this.collectionsMeta;

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const { data } = await collectionManager.list(type);
    this.collectionsMeta = data.map(this.wrangleGallery);
    return this.collectionsMeta;
  };
}

export { Collection, Item, Gallery };
