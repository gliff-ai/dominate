import sodium from "libsodium-wrappers";
import {
  Account,
  Collection,
  CollectionManager,
  ItemManager,
  toBase64,
  OutputFormat,
  CollectionAccessLevel,
  ItemMetadata,
} from "etebase";

import { Task } from "@gliff-ai/style";
import { Annotations, Annotation, AuditAction } from "@gliff-ai/annotate";
import { AnnotationSession } from "@gliff-ai/audit";
import { ImageFileInfo } from "@gliff-ai/upload";
import { NavigateFunction } from "react-router-dom";
import { User } from "@/services/user/interfaces";
import { wordlist } from "@/wordlist";
import {
  GalleryMeta,
  GalleryTile,
  FileInfo,
  ImageMeta,
  AnnotationMeta,
  AuditMeta,
  migrations,
} from "@/interfaces";

interface BaseMeta {
  version: number;
  type: string;
}

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

  navigate: NavigateFunction;

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
    const collection = await this.fetch(collectionManager, collectionUid);

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
    const collection = await this.fetch(collectionManager, collectionUid);

    const meta = collection.getMeta();
    collection.setMeta({
      ...meta,
      modifiedTime: Date.now(),
      name: collectionName,
    });

    await collectionManager.transaction(collection);
  };

  updateCollectionMeta = async (
    collectionUid: string,
    newMeta: Partial<{
      defaultLabels: string[];
      restrictLabels: boolean;
      multiLabel: boolean;
    }>
  ): Promise<void> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetch(collectionManager, collectionUid);

    const oldMeta = collection.getMeta();
    collection.setMeta({
      ...oldMeta,
      ...newMeta, // should overwrite any fields that are already in oldMeta
      modifiedTime: Date.now(),
    });

    await collectionManager.upload(collection);
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

  wrangleGallery = (col: Collection): GalleryMeta & { uid: string } => {
    const meta = col.getMeta();
    const modifiedTime = meta.mtime;
    delete meta.mtime;

    return {
      ...meta,
      modifiedTime,
      type: "gliff.gallery",
      uid: col.uid,
    } as GalleryMeta & { uid: string };
  };

  getImagesMeta = async (
    collectionUid: string
  ): Promise<{ tiles: GalleryTile[]; galleryMeta: GalleryMeta }> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();

    const collection = await this.fetch(collectionManager, collectionUid);
    const jsonString = await collection.getContent(OutputFormat.String);

    const json = JSON.parse(jsonString) as GalleryTile[];

    // get collection metadata:
    const meta = this.wrangleGallery(collection);

    return { tiles: json, galleryMeta: meta };
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

  getCollectionMeta = async (
    collectionUid: string
  ): Promise<GalleryMeta & { uid: string }> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetch(collectionManager, collectionUid);

    return { ...collection.getMeta(), uid: collection.uid };
  };

  getCollectionMembers = async (
    collectionUid: string
  ): Promise<{ usernames: string[]; pendingUsernames: string[] } | null> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const invitationManager = this.etebaseInstance.getInvitationManager();

    const collection = await this.fetch(collectionManager, collectionUid);
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
        type: "gliff.gallery",
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
    const collection = await this.fetch(collectionManager, collectionUid);
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
    const collection = await this.fetch(collectionManager, collectionUid);
    const memberManager = collectionManager.getMemberManager(collection);
    await memberManager.remove(username);

    await this.removeAssignee(collectionUid, username);
  };

  createImage = async (
    collectionUid: string,
    imageFileInfos: ImageFileInfo[],
    thumbnails: string[],
    imageContents: string[] | Uint8Array[],
    task: Task,
    setTask: (task: Task) => void
  ): Promise<void> => {
    try {
      // Create/upload new store item for the image:
      const createdTime = new Date().getTime();
      // Retrieve collectionManager
      const collectionManager = this.etebaseInstance.getCollectionManager();

      const collectionPromises: Promise<Collection>[] = [];

      for (let i = 0; i < imageFileInfos.length; i += 1) {
        const imageFileInfo = imageFileInfos[i];
        const imageContent = imageContents[i];

        // Create new image item and add it to the collection
        collectionPromises.push(
          collectionManager.create<ImageMeta>( // partial because we can't know the uid yet, etebase assigns it here
            "gliff.image",
            {
              type: "gliff.image",
              version: 0,
              name: imageFileInfo.fileName,
              createdTime,
              modifiedTime: createdTime,
              fileInfo: imageFileInfo,
            },
            imageContent
          )
        );
      }

      setTask({ ...task, progress: 30 });

      // save new image items:
      const newCollections = await Promise.all(collectionPromises);
      await this.batchUpload(collectionManager, newCollections);

      const newTiles: GalleryTile[] = [];
      for (let i = 0; i < imageFileInfos.length; i += 1) {
        // Add the image's metadata/thumbnail and a pointer to the image item to the gallery's content:
        newTiles.push({
          id: newCollections[i].uid, // an id representing the whole unit (image, annotation and audit), expected by curate. should be the same as imageUID (a convention for the sake of simplicity).
          thumbnail: thumbnails[i],
          imageLabels: [],
          assignees: [],
          fileInfo: imageFileInfos[i],
          imageUID: newCollections[i].uid,
          annotationUID: {},
          annotationComplete: {},
          auditUID: {},
        });
      }

      setTask({ ...task, progress: 65 });

      // save new gallery tiles:
      const collection = await this.fetch(collectionManager, collectionUid);
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
    const collection = await this.fetch(collectionManager, collectionUid);
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
    const collection = await this.fetch(collectionManager, collectionUid);
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
    const allItems: Collection[] = await this.fetchMulti(
      collectionManager,
      imageUIDs.concat(annotationUIDs).concat(auditUIDs),
      collectionUid
    );

    setTask({ isLoading: true, description: "Image deletion", progress: 75 });

    allItems.forEach((item) => {
      item.delete();
    });

    await this.batchUpload(collectionManager, allItems);

    setTask({ isLoading: false, description: "Image deletion", progress: 100 });
  };

  removeAssignee = async (
    collectionUid: string,
    username: string
  ): Promise<void> => {
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetch(collectionManager, collectionUid);
    const content = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];

    const newContent = content.map((tile) => ({
      ...tile,
      assignees: tile?.assignees?.filter((a) => a !== username) || [], // unassign all items from a user
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
    const collection = await this.fetch(collectionManager, collectionUid);
    const content = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];
    const galleryTile = content.find((item) => item.imageUID === imageUid);

    if (
      !galleryTile?.annotationUID ||
      galleryTile.annotationUID[username] === undefined
    )
      return null;

    const annotationItem = await this.fetch(
      collectionManager,
      galleryTile.annotationUID[username],
      collectionUid
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
  ): Promise<{ meta: AnnotationMeta[][]; annotations: Annotation[][][] }> => {
    // retrieves the Annotations objects for all images by all users

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetch(collectionManager, collectionUid);
    const tiles = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];

    const annotationUIDs = ([] as string[]).concat(
      ...tiles.map((tile) => Object.values(tile.annotationUID))
    ); // [im0_ann0, im0_ann1, im0_ann2, im1_ann0, im1_ann1, ...]
    const annotationItems = await this.fetchMulti(
      collectionManager,
      annotationUIDs,
      collectionUid
    );

    const annotationItemContents = await Promise.all(
      annotationItems.map((annotation) =>
        annotation.getContent(OutputFormat.String)
      )
    );

    const annotationsMeta = await Promise.all(
      annotationItems.map(
        (annotation) => annotation.getMeta() as AnnotationMeta
      )
    );

    // reshape arrays into [[im0_ann0, im0_ann1, im0_ann2], [im1_ann0, im1_ann1], ...]:
    const annotationContentsReshaped: string[][] = [];
    const annotationsMetaReshaped: AnnotationMeta[][] = [];

    tiles.forEach((tile) => {
      const imageAnnotations: string[] = [];
      const imageAnnotationMetas: AnnotationMeta[] = [];
      annotationUIDs.forEach((uid, i) => {
        if (Object.values(tile.annotationUID).includes(uid)) {
          imageAnnotations.push(annotationItemContents[i]);
          imageAnnotationMetas.push(annotationsMeta[i]);
        }
      });
      annotationContentsReshaped.push(imageAnnotations);
      annotationsMetaReshaped.push(imageAnnotationMetas);
    });

    return {
      meta: annotationsMetaReshaped,
      annotations: annotationContentsReshaped.map((contentArray) =>
        contentArray.map((content) => JSON.parse(content) as Annotation[])
      ),
    };
  };

  preMigrate = async (collection: Collection): Promise<Collection> => {
    // migrates a versionless etebase object of unknown structure to V0 of whatever type it is
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const meta: any = collection.getMeta();

    if (!("type" in meta)) {
      // pre-migration-system Gallery collections don't have a type field in metadata, because we thought we didn't need it
      // since collections have type as a required argument on creation
      // but it turns out collection.type isn't a thing, it only works through collectionManager.list
      // Galleries are the only etebase objects we use that don't have a type field, so we can assume that this collection is a gallery:
      meta.type = "gliff.gallery";
    }
    if ((meta as ItemMetadata).type === "gliff.gallery") {
      const content = JSON.parse(
        await collection.getContent(OutputFormat.String)
      ) as any[];

      // migrate GalleryTiles if necessary:
      for (let i = 0; i < content.length; i += 1) {
        if (
          content.length > 0 &&
          (typeof content[0].annotationUID === "string" ||
            content[0].annotationUID === null)
        ) {
          // migrate GalleryTiles to hold multiple annotation / audit UIDs:
          const { annotationUID } = content[i];
          const { auditUID } = content[i];
          content[i].annotationUID = {};
          content[i].auditUID = {};
          if (annotationUID !== null)
            content[i].annotationUID[this.etebaseInstance.user.username] =
              annotationUID;
          if (auditUID !== null)
            content[i].auditUID[this.etebaseInstance.user.username] = auditUID;
        }

        if (!("fileInfo" in content[i]) && "metadata" in content[i]) {
          // migrate tile.metadata -> tile.fileInfo
          content[i].fileInfo = content[i].metadata;
        }

        if (
          !("fileName" in content[i].fileInfo) &&
          "imageName" in content[i].fileInfo
        ) {
          // rename fileInfo.imageName -> fileInfo.fileName:
          content[i].fileInfo.fileName = (
            content[i].fileInfo as FileInfo & { imageName: string }
          ).imageName;
        }

        if (!("annotationComplete" in content[i])) {
          // add annotationComplete field:
          content[i].annotationComplete = {};
        }
      }

      // migrate GalleryMeta to include defaultLabels, restrictLabels and multiLabel if necessary:
      if (!("defaultLabels" in meta)) {
        (meta as { defaultLabels: string[] }).defaultLabels = [];
      }
      if (!("restrictLabels" in meta)) {
        (meta as { restrictLabels: boolean }).restrictLabels = false;
      }
      if (!("multiLabel" in meta)) {
        (meta as { multiLabel: boolean }).multiLabel = false;
      }

      await collection.setContent(JSON.stringify(content));
    } else if ((meta as ItemMetadata).type === "gliff.image") {
      if (!("fileInfo" in meta)) {
        // package file metadata fields into FileInfo:
        const fileInfo = {
          fileName: (meta as { imageName: string }).imageName,
          num_slices: (meta as FileInfo).num_slices,
          num_channels: (meta as FileInfo).num_channels,
          width: (meta as FileInfo).width,
          height: (meta as FileInfo).height,
          size: (meta as FileInfo).size,
          resolution_x: (meta as FileInfo).resolution_x,
          resolution_y: (meta as FileInfo).resolution_y,
          resolution_z: (meta as FileInfo).resolution_z,
          content_hash: (meta as FileInfo).content_hash,
        };
        (meta as { fileInfo: FileInfo }).fileInfo = fileInfo;
      }

      if (!("fileName" in meta.fileInfo) && "imageName" in meta.fileInfo) {
        // migrate fileInfo.imageName -> fileInfo.fileName
        (meta as { fileInfo: FileInfo }).fileInfo.fileName = (
          (meta as { fileInfo: FileInfo }).fileInfo as FileInfo & {
            imageName: string;
          }
        ).imageName;
      }
    } else if (meta.type === "gliff.annotation") {
      if (!("isComplete" in meta)) {
        meta.isComplete = false;
      }
    } else if (meta.type === "gliff.audit") {
      if (!("modifiedTime" in meta)) {
        if ("mtime" in meta) {
          meta.modifiedTime = meta.mtime;
        } else {
          meta.modifiedTime = meta.createdTime;
        }
      }
    }

    (meta as BaseMeta).version = 0;

    collection.setMeta(meta);

    return collection;

    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  };

  migrate = async (
    collectionManager: CollectionManager,
    collection_: Collection
  ): Promise<Collection> => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    let collection = collection_;
    let meta = collection.getMeta<BaseMeta>();
    let content = JSON.parse(await collection.getContent(OutputFormat.String));

    // add version field and pre-migrate to V0 if necessary:
    if (!("version" in meta)) {
      collection = await this.preMigrate(collection);
      await collectionManager.upload(collection);
      meta = collection.getMeta<BaseMeta>();
      content = JSON.parse(await collection.getContent(OutputFormat.String));
    }

    // migrate if necessary:
    if (meta.version < migrations[meta.type].length) {
      const outstandingMigrations = migrations[meta.type].slice(meta.version);
      for (const migration of outstandingMigrations) {
        type CurrentVersion = Parameters<typeof migration>[0];
        // all migrations migrate metadata, because even if only the content changes, meta needs a version number bump:
        meta = migration.meta(meta as CurrentVersion);
        // but not all migrations migrate content:
        if (migration.content !== null) {
          content = migration.content(content);
        }
      }
      collection.setMeta(meta);
      await collection.setContent(JSON.stringify(content));
      await collectionManager.upload(collection);
    }

    return collection;

    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  };

  fetch = async (
    collectionManager: CollectionManager,
    uid: string,
    galleryUid: string | null = null
  ): Promise<Collection> => {
    // fetch collection:
    let collection: Collection;
    try {
      collection = await collectionManager.fetch(uid);
    } catch (e) {
      // it's an Item, convert it to a Collection:
      if (galleryUid === null)
        throw Error(
          "Attempting to convert an Item to a Collection without a galleryUid!"
        );
      const gallery = await collectionManager.fetch(galleryUid);
      const itemManager = collectionManager.getItemManager(gallery);
      const item = await itemManager.fetch(uid);
      const meta = item.getMeta();
      const content = await item.getContent(OutputFormat.String);
      collection = await collectionManager.create(
        meta.type as string,
        meta,
        content
      );
      await collectionManager.upload(collection);

      // update UID in galleryTiles:
      await this.updateUids(gallery, uid, collection.uid);
    }

    collection = await this.migrate(collectionManager, collection);
    return collection;
  };

  updateUids = async (
    gallery: Collection,
    oldUid: string,
    newUid: string
  ): Promise<void> => {
    // changes all occurrences of a UID in gallery by direct string replacement.
    // will re-fetch the gallery and try again if a transaction conflict occurs
    // e.g. due to another thread concurrently updating a different UID
    // can optionally navigate to a new path on success (needed if an imageUID is changed)

    const collectionManager = this.etebaseInstance.getCollectionManager();

    // migrate item UIDs in gallery content to the new collection UID:
    let galleryTiles: string = await gallery.getContent(OutputFormat.String);
    galleryTiles = galleryTiles.replace(new RegExp(oldUid, "g"), newUid);
    await gallery.setContent(galleryTiles);
    try {
      await collectionManager.transaction(gallery);
      console.log(`Migrated ${oldUid} -> ${newUid} in galleryTiles`);
    } catch (err) {
      console.log(
        `Failed to migrate ${oldUid} -> ${newUid} in galleryTiles due to conflict; retrying...`
      );
      // race condition, try again:
      const newGallery = await collectionManager.fetch(gallery.uid);
      await this.updateUids(newGallery, oldUid, newUid);
    }
  };

  fetchMulti = async (
    collectionManager: CollectionManager,
    UIDs: string[],
    galleryUid: string | null = null
  ): Promise<Collection[]> => {
    const promises = UIDs.map((uid) =>
      this.fetch(collectionManager, uid, galleryUid)
    );
    const collections = await Promise.all(promises);
    return collections;
  };

  batchUpload = async (
    collectionManager: CollectionManager,
    collections: Collection[]
  ): Promise<void> => {
    await Promise.all(collections.map((col) => collectionManager.upload(col)));
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

    // Retrieve collectionManager
    const collectionManager = this.etebaseInstance.getCollectionManager();

    // Create new Annotation item
    const createdTime = new Date().getTime();
    const annotationsItem = await collectionManager.create<AnnotationMeta>(
      "gliff.annotation",
      {
        type: "gliff.annotation",
        version: 0,
        mtime: createdTime,
        isComplete,
        createdTime,
      },
      JSON.stringify(annotationData)
    );

    // Create new Audit item:
    const auditItem = await collectionManager.create<AuditMeta>(
      "gliff.audit",
      {
        type: "gliff.audit",
        version: 0,
        modifiedTime: createdTime,
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
    await this.batchUpload(collectionManager, [annotationsItem, auditItem]);

    if (setTask) {
      setTask({
        isLoading: true,
        description: "Saving annotation...",
        progress: 65,
      });
    }

    // Update collection content JSON:
    const collection = await this.fetch(collectionManager, collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];
    const tileIdx = galleryTiles.findIndex(
      (item) => item.imageUID === imageUid
    );
    galleryTiles[tileIdx].annotationUID[username] = annotationsItem.uid;
    galleryTiles[tileIdx].auditUID[username] = auditItem.uid;
    galleryTiles[tileIdx].annotationComplete[username] = isComplete;
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
    const collection = await this.fetch(
      collectionManager,
      collectionUid,
      collectionUid
    );
    setTask({
      isLoading: true,
      description: "Saving annotation in progress, please wait...",
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
    const items = await this.fetchMulti(
      collectionManager,
      [annotationUid, auditUid],
      collectionUid
    );
    setTask({
      isLoading: true,
      description: "Saving annotation in progress, please wait...",
      progress: 70,
    });

    let annotationItem: Collection;
    let auditItem: Collection;
    if (items[0].getMeta().type === "gliff.annotation") {
      // note: this check should be obsolete since adding this.fetchMulti
      [annotationItem, auditItem] = items;
    } else {
      [auditItem, annotationItem] = items;
    }

    const modifiedTime = new Date().getTime();

    // Update annotation item
    annotationItem.setMeta({
      ...annotationItem.getMeta(),
      modifiedTime,
      isComplete,
    });
    await annotationItem.setContent(JSON.stringify(annotationData));

    // Update audit item
    auditItem.setMeta({ ...auditItem.getMeta(), modifiedTime });
    await auditItem.setContent(JSON.stringify(auditData));

    // Save changes
    await this.batchUpload(collectionManager, [annotationItem, auditItem]);
  };

  getItem = async (
    collectionUid: string,
    itemUid: string
  ): Promise<Collection> => {
    // Retrieve item from a collection.
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const item = await this.fetch(collectionManager, itemUid, collectionUid);
    return item;
  };

  getAllImages = async (
    collectionUid: string
  ): Promise<{ meta: ImageMeta; content: string }[]> => {
    // Retrive all image items from a collection

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetch(collectionManager, collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];

    const imageItems = await this.fetchMulti(
      collectionManager,
      galleryTiles.map((tile) => tile.imageUID),
      collectionUid
    );

    const imageContents = await Promise.all(
      imageItems.map((item) => item.getContent(OutputFormat.String))
    );

    return imageItems.map((item, i) => ({
      meta: item.getMeta(),
      content: imageContents[i],
    }));
  };

  getAudits = async (collectionUid: string): Promise<AnnotationSession[]> => {
    // Retrieve all ANNOTATE session audits for the given collection

    // get collection content JSON:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetch(collectionManager, collectionUid);
    const collectionContent = await collection.getContent(OutputFormat.String);
    // get tiles:
    const tiles = JSON.parse(collectionContent) as GalleryTile[];

    // fetch the audits and parse as JSON:
    const auditUIDs = tiles.map((tile) => Object.values(tile.auditUID)).flat();
    if (auditUIDs.length === 0) return [];

    const auditItems = await this.fetchMulti(
      collectionManager,
      auditUIDs,
      collectionUid
    );

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
          imagename: tile.fileInfo.fileName,
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
    const collection = await this.fetch(collectionManager, collectionUid);
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

  giveNavigate = (navigate: NavigateFunction): void => {
    this.navigate = navigate;
  };
}
