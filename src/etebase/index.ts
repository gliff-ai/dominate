import sodium from "libsodium-wrappers";
import {
  Account,
  Collection,
  CollectionManager,
  Item,
  ItemManager,
  toBase64,
  OutputFormat,
  CollectionAccessLevel,
} from "etebase";
import { User } from "@/services/user/interfaces";
import { wordlist } from "@/wordlist";
import { Annotations, Annotation, AuditAction } from "@gliff-ai/annotate";
import { GalleryMeta, GalleryTile, Image, ImageMeta } from "./interfaces";

const getRandomValueFromArrayOrString = (
  dictionary: string | string[],
  count: number
): string[] =>
  Array.from(crypto.getRandomValues(new Uint32Array(count))).map(
    (x) => dictionary[x % dictionary.length]
  );

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

  init = async (account?: Account): Promise<null | User> => {
    const savedSession = localStorage.getItem("etebaseInstance");

    if (account) {
      this.etebaseInstance = account;
    } else if (savedSession) {
      this.etebaseInstance = await Account.restore(savedSession);
    } else {
      this.isLoggedIn = false;
      return null;
    }

    this.ready = true;

    this.isLoggedIn = !!this.etebaseInstance?.user?.username;

    void this.getPendingInvites().then(() => console.log("Checked invites"));

    return {
      username: this.etebaseInstance.user.username,
      authToken: this.etebaseInstance.authToken,
    };
  };

  login = async (username: string, password: string): Promise<User> => {
    await this.init();

    if (!this.isLoggedIn) {
      this.etebaseInstance = await Account.login(
        username,
        password,
        SERVER_URL
      );

      this.ready = true;

      void this.getPendingInvites().then(() => console.log("Checked invites"));

      const newSession = await this.etebaseInstance.save();

      // TODO: encrypt this!
      localStorage.setItem("etebaseInstance", newSession);

      await this.etebaseInstance.fetchToken();
    }
    this.isLoggedIn = true;

    return {
      username: this.etebaseInstance.user.username,
      authToken: this.etebaseInstance.authToken,
    };
  };

  signup = async (email: string, password: string): Promise<User> => {
    this.etebaseInstance = await Account.signup(
      {
        username: toBase64(email),
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

  changePassword = async (newPassword: string): Promise<void> =>
    this.etebaseInstance.changePassword(newPassword);

  #hashRecoveryPhrase = (phrase: string): Uint8Array =>
    sodium.crypto_generichash(32, sodium.from_string(phrase.replace(/ /g, "")));

  restoreSession = async (
    session: string,
    phrase: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const key = this.#hashRecoveryPhrase(phrase);

      const account = await Account.restore(session, key);

      await account.fetchToken();

      await account.changePassword(newPassword);

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  generateRecoveryKey = (): {
    readable: string[];
    hashed: Uint8Array;
  } => {
    const readable = getRandomValueFromArrayOrString(wordlist, 9);

    const hashed = sodium.crypto_generichash(
      32,
      sodium.from_string(readable.join(""))
    );

    return { readable, hashed };
  };

  getPendingInvites = async (): Promise<void> => {
    const invitationManager = this.etebaseInstance.getInvitationManager();

    const invitations = await invitationManager.listIncoming().then(
      (response) => response.data,
      () => [] // catches the "User inactive or deleted" errors when the user isn't verified yet
    );

    for (const invite of invitations) {
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
    const json = await collection.getContent(OutputFormat.String);
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

  getCollectionMembers = async (collectionUid: string): Promise<string[]> => {
    if (this.collections.length > 0) return null;
    if (!this.etebaseInstance) throw new Error("No etebase instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const memberManager = collectionManager.getMemberManager(collection);
    const members = await memberManager.list();

    return members.data.map((m) => m.username);
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
        CollectionAccessLevel.ReadWrite
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

  appendGalleryTile = async (
    collectionManager: CollectionManager,
    collectionUid: string,
    tile: GalleryTile
  ): Promise<void> => {
    // adds a new GalleryTile object to the gallery collection's content JSON
    // uses etebase transactions to prevent race conditions if multiple images are uploaded at once
    // (if race conditions occur, it re-fetches and tries again until it works)

    const collection = await collectionManager.fetch(collectionUid);
    const oldContent = await collection.getContent(OutputFormat.String);

    const content = JSON.stringify(
      (JSON.parse(oldContent) as GalleryTile[]).concat(tile)
    );

    await collection.setContent(content);

    return collectionManager.transaction(collection).catch((e) => {
      // TODO: if it's not a conflict something bad had happened so maybe don't retry?, else
      console.error(e);
      return this.appendGalleryTile(collectionManager, collectionUid, tile);
    });
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
      const newImageItem = await itemManager.create(
        {
          type: "gliff.image",
          createdTime,
          modifiedTime: createdTime,
          width: imageMeta.width,
          height: imageMeta.height,
        },
        imageContent
      );
      await itemManager.batch([newImageItem]);

      // Add the image's metadata/thumbnail and a pointer to the image item to the gallery's content:
      const newTile: GalleryTile = {
        id: newImageItem.uid, // an id representing the whole unit (image, annotation and audit), expected by curate. should be the same as imageUID (a convention for the sake of simplicity).
        thumbnail,
        imageLabels: [],
        metadata: imageMeta,
        imageUID: newImageItem.uid,
        annotationUID: null,
        auditUID: null,
      };
      await this.appendGalleryTile(
        this.etebaseInstance.getCollectionManager(),
        collectionUid,
        newTile
      );
    } catch (err) {
      console.error(err);
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
    const oldContent = await collection.getContent(OutputFormat.String);

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
    const oldContentString = await collection.getContent(OutputFormat.String);
    const oldContent = JSON.parse(oldContentString) as GalleryTile[];

    // cache UIDs of images, annotations and audits to be deleted:
    const imageUIDs: string[] = [];
    const annotationUIDs: string[] = [];
    const auditUIDs: string[] = [];
    oldContent
      .filter((item) => imageUids.includes(item.imageUID))
      .forEach((item) => {
        imageUIDs.push(item.imageUID);
        annotationUIDs.concat(item.annotationUID);
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
    const imagePromises: Promise<Item>[] = [];
    const annotationPromises: Promise<Item>[] = [];
    const auditPromises: Promise<Item>[] = [];
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

  getAnnotationsObject = async (
    collectionUid: string,
    imageUid: string
  ): Promise<Annotations> => {
    // retrieves the Annotations object for the specified image

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const content = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];
    const galleryTile: GalleryTile = content.find(
      (item) => item.imageUID === imageUid
    );

    if (galleryTile.annotationUID === null) return null;

    const itemManager = collectionManager.getItemManager(collection);
    const annotationItem = await itemManager.fetch(galleryTile.annotationUID);
    const annotationContent = await annotationItem.getContent(
      OutputFormat.String
    );

    console.log(JSON.parse(annotationContent));

    return new Annotations(JSON.parse(annotationContent));
  };

  createAnnotation = async (
    collectionUid: string,
    imageUid: string,
    annotationData: Annotation[]
  ): Promise<void> => {
    // Store annotations object in a new item.

    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionUid);

    // Create new item
    const createdTime = new Date().getTime();
    const annotationsItem = await itemManager.create(
      {
        type: "gliff.annotation",
        mtime: createdTime,
        createdTime,
      },
      JSON.stringify(annotationData)
    );

    // Store annotationsItem inside its own collection
    await itemManager.batch([annotationsItem]);

    // Update collection content JSON:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];
    const tileIdx = galleryTiles.findIndex(
      (item) => item.imageUID === imageUid
    );
    galleryTiles[tileIdx].annotationUID = annotationsItem.uid;
    await collection.setContent(JSON.stringify(galleryTiles));
    await collectionManager.upload(collection);
  };

  updateAnnotation = async (
    collectionUid: string,
    imageUid: string,
    annotationData: Annotation[]
  ): Promise<void> => {
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];
    const tile = galleryTiles.find((item) => item.imageUID === imageUid);
    const annotationUid = tile.annotationUID;

    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionUid);
    const item = await itemManager.fetch(annotationUid);

    // Update item's content and modified time
    const modifiedTime = new Date().getTime();
    const meta = item.getMeta();
    delete meta.mtime;

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
    const content = await item.getContent(OutputFormat.String);
    return {
      meta: item.getMeta(),
      type: "gliff.image",
      uid: item.uid,
      content,
    } as Image;
  };
}

export { Collection, Item, GalleryMeta, Image };
