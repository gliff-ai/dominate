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
import { Annotations, Annotation, AuditAction } from "@gliff-ai/annotate";
import { AnnotationSession } from "@gliff-ai/audit";
import { User } from "@/services/user/interfaces";
import { wordlist } from "@/wordlist";
import type {
  GalleryMeta,
  GalleryTile,
  Image,
  ImageMeta,
  AnnotationMeta,
} from "./interfaces";
import { Task } from "@/components";

const logger = console;

const getRandomValueFromArrayOrString = (
  dictionary: string | string[],
  count: number
): string[] =>
  Array.from(crypto.getRandomValues(new Uint32Array(count))).map(
    (x) => dictionary[x % dictionary.length]
  );

export const STORE_URL = import.meta.env.VITE_STORE_URL;
export const SERVER_URL = `${STORE_URL}etebase`;
export const API_URL = `${STORE_URL}django/api`;

export class DominateStore {
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

    void this.getPendingInvites().catch((e) => logger.error(e));

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

      void this.getPendingInvites().catch((e) => logger.log(e));

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

  createTrustedServiceUser = async (): Promise<{
    key: string;
    email: string;
  }> => {
    function base64AddPadding(str: string) {
      return `${str}${Array(((4 - (str.length % 4)) % 4) + 1).join("=")}`;
    }

    const email = `${sodium.randombytes_random()}@trustedservice.gliff.app`;
    const password = sodium.randombytes_buf(64, "base64");
    const key = base64AddPadding(toBase64(`${email}:${password}`));

    await Account.signup(
      {
        username: toBase64(email),
        email,
      },
      password,
      SERVER_URL
    );

    return { key, email };
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
      logger.error(e);
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
      void invitationManager.accept(invite).catch((e) => logger.log(e));
    }
  };

  getCollectionContent = async (
    collectionUid: string
  ): Promise<{
    uid: string;
    content: GalleryTile[];
  }> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);

    return {
      uid: collectionUid,
      content: JSON.parse(
        await collection.getContent(OutputFormat.String)
      ) as GalleryTile[],
    };
  };

  updateCollectionName = async (
    collectionUid: string,
    collectionName: string
  ): Promise<void> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);

    const meta = collection.getMeta();
    collection.setMeta({
      ...meta,
      modifiedTime: Date.now(),
      name: collectionName,
    });

    await collectionManager.transaction(collection);
  };

  getCollectionsContent = async (
    type = "gliff.gallery"
  ): Promise<
    {
      uid: string;
      content: GalleryTile[];
    }[]
  > => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const { data } = await collectionManager.list(type);

    const settledPromises = await Promise.allSettled(
      data.map(this.wrangleCollectionsContent)
    );

    const resolved: {
      uid: string;
      content: GalleryTile[];
    }[] = [];
    settledPromises.forEach((result) => {
      if (result.status === "fulfilled") {
        resolved.push(result.value);
      }
    });
    return resolved;
  };

  wrangleCollectionsContent = async (
    collection: Collection
  ): Promise<{ uid: string; content: GalleryTile[] }> => {
    const content = await collection.getContent(OutputFormat.String);
    return {
      uid: collection.uid,
      content: JSON.parse(content) as GalleryTile[],
    };
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

  getImagesMeta = async (
    collectionUid: string,
    username: string
  ): Promise<GalleryTile[]> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const collection = await collectionManager.fetch(collectionUid);
    const jsonString = await collection.getContent(OutputFormat.String);

    type OldGalleryTile = Omit<GalleryTile, "annotationUID" | "auditUID"> & {
      annotationUID: string;
      auditUID: string;
    };
    const json = JSON.parse(jsonString) as GalleryTile[] | OldGalleryTile[];

    // migrate GalleryTiles to new format if necessary:
    if (
      json.length > 0 &&
      (typeof json[0].annotationUID === "string" ||
        json[0].annotationUID === null)
    ) {
      // migrate to new format:
      for (let i = 0; i < json.length; i += 1) {
        const { annotationUID } = json[i];
        const { auditUID } = json[i];
        json[i].annotationUID = {};
        json[i].auditUID = {};
        if (annotationUID !== null)
          json[i].annotationUID[username] = annotationUID;
        if (auditUID !== null) json[i].auditUID[username] = auditUID;
      }

      // update in store:
      await collection.setContent(JSON.stringify(json));
      await collectionManager.upload(collection);
    }
    return json as GalleryTile[];
  };

  getCollectionsMeta = async (
    type = "gliff.gallery"
  ): Promise<GalleryMeta[]> => {
    if (this.collections.length > 0) return this.collectionsMeta;
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const { data } = await collectionManager.list(type);
    this.collectionsMeta = data.map(this.wrangleGallery);
    return this.collectionsMeta;
  };

  getCollectionMeta = async (collectionUid: string): Promise<GalleryMeta> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);

    return { ...collection.getMeta(), uid: collection.uid };
  };

  getCollectionMembers = async (
    collectionUid: string
  ): Promise<{ usernames: string[]; pendingUsernames: string[] } | null> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const invitationManager = this.etebaseInstance.getInvitationManager();

    const collection = await collectionManager.fetch(collectionUid);
    const memberManager = collectionManager.getMemberManager(collection);
    const members = await memberManager.list();
    const invitations = await invitationManager.listOutgoing();

    return {
      usernames: members.data.map(({ username }) => username),
      pendingUsernames: invitations.data
        .filter((item) => item.collection === collectionUid)
        .map(({ username }) => username)
        .filter((item, i, array) => array.indexOf(item) === i), // filter out duplicates
    };
  };

  getCollectionsMembers = async (
    type = "gliff.gallery"
  ): Promise<
    {
      uid: string;
      usernames: string[];
      pendingUsernames: string[];
    }[]
  > => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const invitationManager = this.etebaseInstance.getInvitationManager();
    const { data } = await collectionManager.list(type);

    const resolved: {
      uid: string;
      usernames: string[];
      pendingUsernames: string[];
    }[] = [];
    await Promise.allSettled(
      data.map(async (collection) => {
        const memberManager = collectionManager.getMemberManager(collection);
        const members = await memberManager.list();
        const invitations = await invitationManager.listOutgoing();

        return {
          uid: collection.uid,
          usernames: members.data.map(({ username }) => username),
          pendingUsernames: invitations.data
            .filter((item) => item.collection === collection.uid)
            .map(({ username }) => username)
            .filter((item, i, array) => array.indexOf(item) === i), // filter out duplicates
        };
      })
    ).then((results) =>
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          resolved.push(result.value);
        }
      })
    );

    return resolved;
  };

  createCollection = async (name: string): Promise<string> => {
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
    return collection.uid;
  };

  // TODO change this to return errors and display them when we do styling etc
  inviteUserToCollection = async (
    collectionUid: string,
    userEmail: string
  ): Promise<boolean> => {
    // You can in theory invite ANY user to a collection with this, but the UI currently limits it to team members

    if (!this.etebaseInstance) throw new Error("No store instance");
    const store = this.etebaseInstance;

    const collectionManager = store.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const memberManager = collectionManager.getMemberManager(collection);
    const members = await memberManager.list();

    // Print the users and their access levels
    for (const member of members.data) {
      // Check if user already has access
      if (member.username === userEmail) {
        logger.log("User already has access");
        return false;
      }
    }

    const invitationManager = store.getInvitationManager();

    // Fetch their public key
    const user2 = await invitationManager.fetchUserProfile(userEmail);

    if (!user2) {
      logger.log("User doesn't exist");
    }
    // Verify user2.pubkey is indeed the pubkey you expect.!!!

    try {
      // Assuming the pubkey is as expected, send the invitation
      await invitationManager.invite(
        collection,
        userEmail,
        user2.pubkey,
        CollectionAccessLevel.ReadWrite
      );

      return true;
    } catch (e) {
      logger.log(e);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e?.content?.code) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        logger.error(e?.content?.code);
        return false;
      }

      logger.error("Unknown Invite Error");
      return false;
    }
  };

  revokeAccessToCollection = async (
    collectionUid: string,
    username: string
  ): Promise<void> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const memberManager = collectionManager.getMemberManager(collection);
    await memberManager.remove(username);

    await this.removeAssignee(collectionUid, username);
  };

  getItemManager = async (collectionUid: string): Promise<ItemManager> => {
    if (!this.etebaseInstance) throw new Error("No store instance");
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
    // uses store transactions to prevent race conditions if multiple images are uploaded at once
    // (if race conditions occur, it re-fetches and tries again until it works)

    const collection = await collectionManager.fetch(collectionUid);
    const oldContent = await collection.getContent(OutputFormat.String);

    const content = JSON.stringify(
      (JSON.parse(oldContent) as GalleryTile[]).concat(tile)
    );

    await collection.setContent(content);

    return collectionManager.transaction(collection).catch((e) => {
      // TODO: if it's not a conflict something bad had happened so maybe don't retry?, else
      logger.error(e);
      return this.appendGalleryTile(collectionManager, collectionUid, tile);
    });
  };

  createImage = async (
    collectionUid: string,
    imageMetas: ImageMeta[],
    thumbnails: string[],
    imageContents: string[] | Uint8Array[],
    task: Task,
    setTask: (task: Task) => void
  ): Promise<void> => {
    try {
      // Create/upload new store item for the image:
      const createdTime = new Date().getTime();
      // Retrieve itemManager
      const itemManager = await this.getItemManager(collectionUid);

      const itemPromises: Promise<Item>[] = [];

      for (let i = 0; i < imageMetas.length; i += 1) {
        const imageMeta = imageMetas[i];
        const imageContent = imageContents[i];

        // Create new image item and add it to the collection
        itemPromises.push(
          itemManager.create(
            {
              type: "gliff.image",
              name: imageMeta.imageName,
              createdTime,
              modifiedTime: createdTime,
              width: imageMeta.width,
              height: imageMeta.height,
            },
            imageContent
          )
        );
      }

      setTask({ ...task, progress: 30 });

      // save new image items:
      const newItems = await Promise.all(itemPromises);
      await itemManager.batch(newItems);

      const newTiles: GalleryTile[] = [];
      for (let i = 0; i < imageMetas.length; i += 1) {
        // Add the image's metadata/thumbnail and a pointer to the image item to the gallery's content:
        newTiles.push({
          id: newItems[i].uid, // an id representing the whole unit (image, annotation and audit), expected by curate. should be the same as imageUID (a convention for the sake of simplicity).
          thumbnail: thumbnails[i],
          imageLabels: [],
          assignees: [],
          metadata: imageMetas[i],
          imageUID: newItems[i].uid,
          annotationUID: {},
          annotationComplete: {},
          auditUID: {},
        });
      }

      setTask({ ...task, progress: 65 });

      // save new gallery tiles:
      const collectionManager = this.etebaseInstance.getCollectionManager();
      const collection = await collectionManager.fetch(collectionUid);
      const oldContent = await collection.getContent(OutputFormat.String);
      const newContent = JSON.stringify(
        (JSON.parse(oldContent) as GalleryTile[]).concat(newTiles)
      );
      await collection.setContent(newContent);
      setTask({ ...task, progress: 75 });
      await collectionManager.upload(collection);
      setTask({ ...task, progress: 100 });
    } catch (err) {
      logger.error(err);
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

    // save updated metadata in store:
    await collection.setContent(JSON.stringify(newContent));
    await collectionManager.upload(collection);
  };

  deleteImages = async (
    collectionUid: string,
    uidsToDelete: string[],
    task: Task,
    setTask: (task: Task) => void
  ): Promise<void> => {
    setTask({ isLoading: true, description: "Image deletion", progress: 0 });

    // get gallery items metadata from gallery collection:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const oldContentString = await collection.getContent(OutputFormat.String);
    const oldContent = JSON.parse(oldContentString) as GalleryTile[];

    setTask({ isLoading: true, description: "Image deletion", progress: 20 });

    // cache UIDs of images, annotations and audits to be deleted:
    const imageUIDs: string[] = [];
    const annotationUIDs: string[] = [];
    const auditUIDs: string[] = [];
    oldContent
      .filter((item) => uidsToDelete.includes(item.imageUID))
      .forEach((item) => {
        imageUIDs.push(item.imageUID);
        if (Object.keys(item.annotationUID).length > 0) {
          // collect UIDs of all annotations for this image:
          Object.entries(item.annotationUID).forEach(
            ([username, annotationUID]) => {
              annotationUIDs.push(annotationUID);
            }
          );
        }
        if (Object.keys(item.auditUID).length > 0) {
          // collect UIDs of all audits for this image:
          Object.entries(item.auditUID).forEach(([username, auditUID]) => {
            auditUIDs.push(auditUID);
          });
        }
      });

    // remove GalleryTile's whose imageUID is in uidsToDelete:
    const newContent: GalleryTile[] = oldContent.filter(
      (item) => !uidsToDelete.includes(item.imageUID)
    );

    // save updated metadata in store:
    await collection.setContent(JSON.stringify(newContent));
    await collectionManager.upload(collection);

    setTask({ isLoading: true, description: "Image deletion", progress: 50 });

    // delete image, annotation and audit items:
    const itemManager = collectionManager.getItemManager(collection);
    const allItems: {
      data: Item[];
      stoken: string;
      done: boolean;
    } = await itemManager.fetchMulti(
      imageUIDs.concat(annotationUIDs).concat(auditUIDs)
    );

    setTask({ isLoading: true, description: "Image deletion", progress: 75 });

    allItems.data.forEach((item) => {
      item.delete();
    });

    await itemManager.batch(allItems.data);

    setTask({ isLoading: false, description: "Image deletion", progress: 100 });
  };

  removeAssignee = async (
    collectionUid: string,
    username: string
  ): Promise<void> => {
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const content = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];

    const newContent = content.map((tile) => ({
      ...tile,
      assignees: tile.assignees.filter((a) => a !== username), // unassign all items from a user
    }));

    await collection.setContent(JSON.stringify(newContent));
    await collectionManager.transaction(collection);
  };

  getAnnotationsObject = async (
    collectionUid: string,
    imageUid: string,
    username: string
  ): Promise<{ meta: AnnotationMeta; annotations: Annotations } | null> => {
    // retrieves the Annotations object by the specified user for the specified image

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const content = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];
    const galleryTile = content.find((item) => item.imageUID === imageUid);

    if (
      !galleryTile?.annotationUID ||
      galleryTile.annotationUID[username] === undefined
    )
      return null;

    const itemManager = collectionManager.getItemManager(collection);
    const annotationItem = await itemManager.fetch(
      galleryTile.annotationUID[username]
    );
    const annotationContent = await annotationItem.getContent(
      OutputFormat.String
    );

    const annotationMeta = annotationItem.getMeta() as AnnotationMeta;

    return {
      meta: annotationMeta,
      annotations: new Annotations(JSON.parse(annotationContent)),
    };
  };

  getAllAnnotationsObjects = async (
    collectionUid: string
  ): Promise<{ meta: AnnotationMeta[][]; annotations: Annotation[][] }> => {
    // retrieves the Annotations objects for all images by all users

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const tiles = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];

    const itemManager = collectionManager.getItemManager(collection);
    const annotationItems = await itemManager.fetchMulti(
      ([] as string[]).concat(
        ...tiles.map((tile) => Object.values(tile.annotationUID))
      )
    );

    const annotationContents = await Promise.all(
      annotationItems.data.map((annotation) =>
        annotation.getContent(OutputFormat.String)
      )
    );

    const annotationsMeta = await Promise.all(
      annotationItems.data.map(
        (annotation) => annotation.getMeta() as AnnotationMeta
      )
    );

    // reshape arrays into [[im0_ann0, im0_ann1, im0_ann2], [im1_ann0, im1_ann1], ...]:
    let uid: string = "";
    const annotationContentsReshaped: string[][] = [];
    const annotationsMetaReshaped: AnnotationMeta[][] = [];
    for (let i = 0; i < annotationsMeta.length; i += 1) {
      // this will work so long as fetchMulti returns items in the same order they're specified...
      if (annotationsMeta[i].uid !== uid) {
        annotationsMetaReshaped.push([]);
        annotationContentsReshaped.push([]);
        uid = annotationsMeta[i].uid;
      }
      annotationsMetaReshaped[annotationsMetaReshaped.length - 1].push(
        annotationsMeta[i]
      );
      annotationContentsReshaped[annotationContentsReshaped.length - 1].push(
        annotationContents[i]
      );
    }

    return {
      meta: annotationsMetaReshaped,
      annotations: annotationContentsReshaped.map((contentArray) =>
        contentArray.map((content) => JSON.parse(content) as Annotation)
      ),
    };
  };

  createAnnotation = async (
    collectionUid: string,
    imageUid: string,
    annotationData: Annotation[],
    auditData: AuditAction[],
    isComplete = false,
    username: string,
    setTask?: (task: Task) => void
  ): Promise<void> => {
    // Store annotations object in a new item.

    // Retrieve itemManager
    const itemManager = await this.getItemManager(collectionUid);

    // Create new Annotation item
    const createdTime = new Date().getTime();
    const annotationsItem = await itemManager.create(
      {
        type: "gliff.annotation",
        mtime: createdTime,
        isComplete,
        createdTime,
      },
      JSON.stringify(annotationData)
    );

    // Create new Audit item:
    const auditItem = await itemManager.create(
      {
        type: "gliff.audit",
        mtime: createdTime,
        createdTime,
      },
      JSON.stringify(auditData)
    );

    if (setTask) {
      setTask({
        isLoading: true,
        description: "Saving annotation...",
        progress: 30,
      });
    }

    // Store annotationsItem and auditItem inside the collection:
    await itemManager.batch([annotationsItem, auditItem]);

    if (setTask) {
      setTask({
        isLoading: true,
        description: "Saving annotation...",
        progress: 65,
      });
    }

    // Update collection content JSON:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];
    const tileIdx = galleryTiles.findIndex(
      (item) => item.imageUID === imageUid
    );
    galleryTiles[tileIdx].annotationUID[username] = annotationsItem.uid;
    galleryTiles[tileIdx].auditUID[username] = auditItem.uid;
    await collection.setContent(JSON.stringify(galleryTiles));
    await collectionManager.upload(collection);

    if (setTask) {
      setTask({
        isLoading: true,
        description: "Saving annotation...",
        progress: 100,
      });
    }
  };

  updateAnnotation = async (
    collectionUid: string,
    imageUid: string,
    annotationData: Annotation[],
    auditData: AuditAction[],
    isComplete: boolean,
    task: Task,
    setTask: (task: Task) => void,
    username: string
  ): Promise<void> => {
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    setTask({
      isLoading: true,
      description: "Saving annotation...",
      progress: 35,
    });
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];

    let contentHasChanged = false;
    const tile = galleryTiles.find((item) => {
      const isSelected = item.imageUID === imageUid;
      if (isSelected) {
        if (item.annotationComplete === undefined) {
          item.annotationComplete = {};
          contentHasChanged = true;
        }
        if (item.annotationComplete[username] !== isComplete) {
          item.annotationComplete[username] = isComplete;
          contentHasChanged = true;
        }
      }
      return isSelected;
    });

    if (tile === undefined) return;

    if (contentHasChanged) {
      await collection.setContent(JSON.stringify(galleryTiles));
      await collectionManager.transaction(collection);
    }

    const annotationUid = tile.annotationUID[username];
    const auditUid = tile.auditUID[username];
    if (!annotationUid || !auditUid) return;

    // Retrieve items
    const itemManager = await this.getItemManager(collectionUid);
    const items = await itemManager.fetchMulti([annotationUid, auditUid]);
    setTask({
      isLoading: true,
      description: "Saving annotation...",
      progress: 70,
    });
    const annotationItem = items.data[0];
    const auditItem = items.data[1];

    // Update annotationItem:
    let meta = annotationItem.getMeta();
    const mtime = new Date().getTime();
    annotationItem.setMeta({
      ...meta,
      mtime,
      isComplete,
    });
    await annotationItem.setContent(JSON.stringify(annotationData));

    // Update auditItem:
    meta = auditItem.getMeta();
    auditItem.setMeta({ ...meta, mtime });
    await auditItem.setContent(JSON.stringify(auditData));

    // Save changes
    await itemManager.batch([annotationItem, auditItem]);

    setTask({
      isLoading: true,
      description: "Saving annotation...",
      progress: 100,
    });
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
      type: "gliff.image",
      uid: item.uid,
      content,
    } as Image;
  };

  getAllImages = async (collectionUid: string): Promise<Image[]> => {
    // Retrive all image items from a collection

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];

    const itemManager = collectionManager.getItemManager(collection);

    const imageItems = (
      await itemManager.fetchMulti(galleryTiles.map((tile) => tile.imageUID))
    ).data;
    const imageContents = await Promise.all(
      imageItems.map((item) => item.getContent(OutputFormat.String))
    );
    return imageItems.map(
      (item, i) =>
        ({
          name: item.getMeta().name,
          createdTime: item.getMeta().mtime,
          modifiedTime: item.getMeta().mtime,
          type: "gliff.image",
          uid: item.uid,
          content: imageContents[i],
        } as Image)
    );
  };

  getAudits = async (collectionUid: string): Promise<AnnotationSession[]> => {
    // Retrieve all ANNOTATE session audits for the given collection

    // get collection content JSON:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    // get tiles:
    const tiles = JSON.parse(collectionContent) as GalleryTile[];

    // fetch the audits and parse as JSON:
    const itemManager = collectionManager.getItemManager(collection);
    const auditUIDs = tiles.map((tile) => Object.values(tile.auditUID)).flat();
    if (auditUIDs.length === 0) return [];

    const auditItems = (await itemManager.fetchMulti(auditUIDs)).data;

    const auditStrings: string[] = await Promise.all(
      auditItems.map((audit) => audit.getContent(OutputFormat.String))
    );

    const audits = auditStrings.map(
      (audit) => JSON.parse(audit) as AuditAction[]
    );

    // fetchMulti takes a flat list of UIDs and returns a flat list of items, so we need to
    // splice the audits, usernames and imageNames back together:

    let sessions = tiles
      .map((tile) =>
        Object.keys(tile.auditUID).map((username) => ({
          username,
          imagename: tile.metadata.imageName,
        }))
      )
      .flat();

    if (sessions.length !== audits.length) {
      console.error(
        "Assertion error: sessions and audits are different lengths"
      );
    }

    sessions = sessions.map((session, i) => ({
      ...session,
      audit: audits[i],
      timestamp: audits[i][0].timestamp, // timestamp of the first action in the ANNOTATE session
    }));

    return sessions;
  };

  setAssignees = async (
    collectionUid: string,
    imageUids: string[],
    newAssignees: string[][]
  ): Promise<void> => {
    if (imageUids.length !== newAssignees.length) {
      logger.error(
        `Parameters "imageUids" and "newAssignees" should be of equal length.`
      );
      return;
    }
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const oldContent = await collection.getContent(OutputFormat.String);

    let newContent: GalleryTile[] = JSON.parse(oldContent) as GalleryTile[];

    imageUids.forEach((imageUid, i) => {
      newContent = newContent.map((item) => {
        if (item.imageUID === imageUid) {
          if (item.annotationComplete === undefined) {
            item.annotationComplete = {};
          }
          const annotationComplete = {};
          newAssignees[i].forEach((assignee) => {
            annotationComplete[assignee] =
              item.annotationComplete[assignee] !== undefined
                ? item.annotationComplete[assignee]
                : false;
          });

          return { ...item, assignees: newAssignees[i], annotationComplete };
        }
        return item;
      });
    });

    await collection.setContent(JSON.stringify(newContent));
    await collectionManager.upload(collection);
  };
}

export { Collection, Item, GalleryMeta, Image };
