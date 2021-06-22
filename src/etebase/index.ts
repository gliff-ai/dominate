import * as Etebase from "etebase";
import { Account, Collection, Item, ItemManager } from "etebase";
import { User } from "@/services/user/interfaces";
import {
  GalleryMeta,
  GalleryTile,
  Image,
  ImageMeta,
  Annotation,
  AnnotationData,
} from "./interfaces";

declare const STORE_URL: string;
const SERVER_URL = `${STORE_URL}etebase`;
export const API_URL = `${STORE_URL}django/api`;

export class DominateEtebase {
  etebaseInstance: Account;

  ready: boolean;

  collections: Collection[];

  collectionsMeta: GalleryMeta[];

  public isLoggedIn: boolean;

  constructor() {
    this.collections = [];
    this.collectionsMeta = [];
    this.isLoggedIn = false;
    this.ready = false;
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

      this.ready = true;

      this.isLoggedIn = !!this.etebaseInstance?.user?.username;

      void this.getPendingInvites().then(() => console.log("Checked invites"));

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

      this.ready = true;

      void this.getPendingInvites().then(() => console.log("Checked invites"));

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

  getPendingInvites = async (): Promise<void> => {
    const invitationManager = this.etebaseInstance.getInvitationManager();

    const invitations = await invitationManager.listIncoming();

    for (const invite of invitations.data) {
      void invitationManager
        .accept(invite)
        .then(() => console.log("Accepted Invite"));
    }
  };

  wrangleGallery = (col: Collection): GalleryMeta => {
    const meta = col.getMeta();
    const modifiedTime = meta.mtime;
    delete meta.mtime;

    return {
      ...meta,
      modifiedTime,
      type: "gliff.gallery",
      uid: col.uid,
    } as GalleryMeta;
  };

  getImagesMeta = async (collectionUid: string): Promise<GalleryTile[]> => {
    if (!this.etebaseInstance) throw new Error("No etebase instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const collection = await collectionManager.fetch(collectionUid);
    const json = await collection.getContent(Etebase.OutputFormat.String);
    return JSON.parse(json) as GalleryTile[];
  };

  getCollectionsMeta = async (
    type = "gliff.gallery"
  ): Promise<GalleryMeta[]> => {
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
      "gliff.gallery", // type
      {
        name,
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        description: "[]",
      }, // metadata
      "[]" // content
    );
    await collectionManager.upload(collection);
  };

  // TODO change this to return errors and display them when we do styling etc
  inviteUserToCollection = async (
    collectionUid: string,
    userEmail: string
  ): Promise<boolean> => {
    // You can in theory invite ANY user to a collection with this, but the UI currently limits it to team members

    if (!this.etebaseInstance) throw new Error("No etebase instance");
    const etebase = this.etebaseInstance;

    const collectionManager = etebase.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const memberManager = collectionManager.getMemberManager(collection);
    const members = await memberManager.list();

    // Print the users and their access levels
    for (const member of members.data) {
      // Check if user already has access
      if (member.username === userEmail) {
        console.log("User already has access");
        return false;
      }
    }

    const invitationManager = etebase.getInvitationManager();

    // Fetch their public key
    const user2 = await invitationManager.fetchUserProfile(userEmail);

    if (!user2) {
      console.log("User doesn't exist");
    }
    // Verify user2.pubkey is indeed the pubkey you expect.!!!

    try {
      // Assuming the pubkey is as expected, send the invitation
      const res = await invitationManager.invite(
        collection,
        userEmail,
        user2.pubkey,
        Etebase.CollectionAccessLevel.ReadOnly
      );

      return true;
    } catch (e: any) {
      console.log(e);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e?.content?.code) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error(e?.content?.code);
        return false;
      }

      console.error("Unknown Invite Error");
      return false;
    }
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
    thumbnail: string,
    imageContent: string | Uint8Array
  ): Promise<void> => {
    try {
      // Create/upload new etebase item for the image:
      const createdTime = new Date().getTime();
      // Retrieve itemManager
      const itemManager = await this.getItemManager(collectionUid);

      // Create new image item and add it to the collection
      const item = await itemManager.create(
        {
          type: "gliff.image",
          createdTime,
          modifiedTime: createdTime,
          width: imageMeta.width,
          height: imageMeta.height,
        },
        imageContent
      );
      await itemManager.batch([item]);

      // Add the image's metadata/thumbnail and a pointer to the image item to the gallery's content:
      const collectionManager = this.etebaseInstance.getCollectionManager();

      while (true) {
        const collection = await collectionManager.fetch(collectionUid);
        const oldContent = await collection.getContent(
          Etebase.OutputFormat.String
        );
        const content = JSON.stringify(
          (JSON.parse(oldContent) as GalleryTile[]).concat({
            metadata: imageMeta,
            imageLabels: [],
            thumbnail,
            id: item.uid, // // an id representing the whole unit (image, annotation and audit), expected by curate. should be the same as imageUID (a convention for the sake of simplicity).
            imageUID: item.uid,
            annotationUID: null,
            auditUID: null,
          })
        );
        await collection.setContent(content);
        try {
          await collectionManager.transaction(collection);
          break;
        } catch (err) {
          console.log("Transaction conflict, retrying...");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  setImageLabels = async (
    collectionUid: string,
    imageUid: string,
    newLabels: string[]
  ): Promise<void> => {
    // get gallery items metadata from gallery collection:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const oldContent = await collection.getContent(Etebase.OutputFormat.String);

    // iterate through GalleryTile's, find the one whose imageUID matches imageUid, set its imageLabesl to newLabels:
    let newContent: GalleryTile[] = JSON.parse(oldContent) as GalleryTile[];
    newContent = newContent.map((item) => {
      if (item.imageUID === imageUid) {
        return { ...item, imageLabels: newLabels };
      }
      return item;
    });

    // save updated metadata in etebase:
    await collection.setContent(JSON.stringify(newContent));
    await collectionManager.upload(collection);
  };

  deleteImages = async (
    collectionUid: string,
    imageUids: string[]
  ): Promise<void> => {
    // get gallery items metadata from gallery collection:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const oldContentString = await collection.getContent(
      Etebase.OutputFormat.String
    );
    const oldContent = JSON.parse(oldContentString) as GalleryTile[];

    // cache UIDs of images, annotations and audits to be deleted:
    const imageUIDs: string[] = [];
    const annotationUIDs: string[] = [];
    const auditUIDs: string[] = [];
    oldContent
      .filter((item) => imageUids.includes(item.imageUID))
      .forEach((item) => {
        imageUIDs.push(item.imageUID);
        annotationUIDs.push(item.annotationUID);
        auditUIDs.push(item.auditUID);
      });

    // remove GalleryTile's whose imageUID is in imageUids:
    const newContent: GalleryTile[] = oldContent.filter(
      (item) => !imageUids.includes(item.imageUID)
    );

    // save updated metadata in etebase:
    await collection.setContent(JSON.stringify(newContent));
    await collectionManager.upload(collection);

    // delete image, annotation and audit items:
    const itemManager = collectionManager.getItemManager(collection);
    const imagePromises: Promise<Etebase.Item>[] = [];
    const annotationPromises: Promise<Etebase.Item>[] = [];
    const auditPromises: Promise<Etebase.Item>[] = [];
    for (let i = 0; i < imageUIDs.length; i += 1) {
      imagePromises.push(itemManager.fetch(imageUIDs[i]));

      if (annotationUIDs[i]) {
        // annotationUID and auditUID are initialised as null in createImage, and will still be null unless they've been set
        annotationPromises.push(itemManager.fetch(annotationUIDs[i]));
      }

      if (auditUIDs[i]) {
        auditPromises.push(itemManager.fetch(auditUIDs[i]));
      }
    }

    const images = await Promise.all(imagePromises);
    const annotations = await Promise.all(annotationPromises);
    const audits = await Promise.all(auditPromises);

    for (let i = 0; i < images.length; i += 1) {
      images[i].delete();
      annotations[i]?.delete();
      audits[i]?.delete();
    }

    await itemManager.batch(images.concat(annotations).concat(audits));
  };

  wrangleAnnotations = async (item: Item): Promise<Annotation> => {
    const meta = item.getMeta();
    const content = await item.getContent(Etebase.OutputFormat.String);
    return {
      ...meta,
      uid: item.uid,
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
    annotationData: AnnotationData
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
      JSON.stringify(annotationData)
    );

    // Store item inside its own collection
    await itemManager.batch([item]);
  };

  updateAnnotation = async (
    collectionUid: string,
    annotationUid: string,
    annotationData: AnnotationData
  ): Promise<void> => {
    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionUid);
    const item = await itemManager.fetch(annotationUid);

    // Update item's content and modified time
    const modifiedTime = new Date().getTime();
    const meta = item.getMeta() as Annotation;
    delete meta.modifiedTime;

    item.setMeta({ ...meta, modifiedTime });
    await item.setContent(JSON.stringify(annotationData));

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
      meta: item.getMeta(),
      type: "gliff.image",
      uid: item.uid,
      content,
    } as Image;
  };
}

export { Collection, Item, GalleryMeta, Image };
