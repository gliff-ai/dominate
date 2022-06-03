import { Dispatch, SetStateAction } from "react";
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
  SignedInvitationRead,
  ItemMetadata,
  base64,
} from "etebase";
import axios from "axios";

import { CollectionMember } from "etebase/dist/lib/OnlineManagers";
import { Task } from "@gliff-ai/style";
import { Annotations, Annotation, AuditAction } from "@gliff-ai/annotate";
import { AnnotationSession } from "@gliff-ai/audit";
import { ImageFileInfo } from "@gliff-ai/upload";
import { User } from "@/services/user/interfaces";
import { wordlist } from "@/wordlist";
import {
  BaseMeta,
  GalleryMeta,
  GalleryTile,
  FileInfo,
  ImageMeta,
  AnnotationMeta,
  AuditMeta,
  migrations,
} from "@/interfaces";

const logger = console;

// TODO: move somewhere else
type ProjectMember = {
  name?: string;
  username: string;
  isPending: boolean;
};

const getRandomValueFromArrayOrString = (
  dictionary: string | string[],
  count: number
): string[] =>
  Array.from(crypto.getRandomValues(new Uint32Array(count))).map(
    (x) => dictionary[x % dictionary.length]
  );

export const STORE_URL = import.meta.env.VITE_STORE_URL;
export const DEMO_DATA_URL = import.meta.env.VITE_DEMO_DATA_URL;
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

  changePassword = async (
    newPassword: string,
    customAccount?: Account
  ): Promise<{ recoveryKey: string[] }> => {
    const account = customAccount || this.etebaseInstance;
    await account.changePassword(newPassword);

    const { readable: recoveryKey, hashed } = this.generateRecoveryKey();
    const savedSession = await account.save(hashed);

    await axios.request({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${account.authToken || ""}`,
      },
      url: `${API_URL}/user/`,
      data: { recovery_key: savedSession },
    });

    return { recoveryKey };
  };

  #hashRecoveryPhrase = (phrase: string): Uint8Array =>
    sodium.crypto_generichash(32, sodium.from_string(phrase.replace(/ /g, "")));

  restoreSession = async (
    session: string,
    phrase: string,
    newPassword: string
  ): Promise<{ recoveryKey: string[] } | null> => {
    try {
      const key = this.#hashRecoveryPhrase(phrase);

      const account = await Account.restore(session, key);

      await account.fetchToken();

      const { recoveryKey } = await this.changePassword(newPassword, account);

      return { recoveryKey }; // show this to user
    } catch (e) {
      logger.error(e);
      return null;
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );

    return {
      uid: collectionUid,
      content: JSON.parse(
        await collection.getContent(OutputFormat.String)
      ) as GalleryTile[],
    };
  };

  updateCollectionMeta = async (
    collectionUid: string,
    {
      meta_version,
      content_version,
      type,
      createdTime,
      ...newMeta
    }: Partial<GalleryMeta>
  ): Promise<boolean> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    try {
      const collectionManager = this.etebaseInstance.getCollectionManager();
      const collection = await this.fetchCollection(
        collectionManager,
        collectionUid
      );

      const meta = collection.getMeta();
      collection.setMeta({
        ...meta,
        modifiedTime: Date.now(),
        ...newMeta,
      });

      await collectionManager.transaction(collection);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  updateGalleryMeta = async (
    collectionUid: string,
    newMeta: Partial<{
      defaultLabels: string[];
      restrictLabels: boolean;
      multiLabel: boolean;
    }>
  ): Promise<void> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );

    const oldMeta = collection.getMeta();
    collection.setMeta({
      ...oldMeta,
      ...newMeta, // should overwrite any fields that are already in oldMeta
      modifiedTime: Date.now(),
    });

    await collectionManager.upload(collection);
  };

  updateGallery = async (
    collectionUid: string,
    newTiles: { [id: string]: Partial<GalleryTile> }
  ): Promise<void> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await collectionManager.fetch(collectionUid);
    const content = await collection.getContent(OutputFormat.String);
    const gallery = JSON.parse(content) as GalleryTile[];

    const newTilesIds = Object.keys(newTiles);
    gallery.forEach((tile) => {
      if (newTilesIds.includes(tile.id)) {
        const { imageLabels, fileInfo } = newTiles[tile.id];
        if (imageLabels !== undefined) {
          tile.imageLabels = imageLabels;
        }
        if (fileInfo !== undefined) {
          // add new fields to fileInfo
          const newFileInfo = { ...tile.fileInfo, ...fileInfo };

          // remove all null values
          for (const key of Object.keys(newFileInfo)) {
            if (newFileInfo[key] === null) {
              delete newFileInfo[key];
            }
          }
          // apply changes
          tile.fileInfo = newFileInfo;
        }
      }
    });

    await collection.setContent(JSON.stringify(gallery));
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
      data
        .filter((collection) => !collection.isDeleted)
        .map(this.wrangleCollectionsContent)
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

    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
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

    this.collectionsMeta = data
      .filter((collection) => !collection.isDeleted)
      .map(this.wrangleGallery);

    return this.collectionsMeta;
  };

  getCollectionMeta = async (
    collectionUid: string
  ): Promise<GalleryMeta & { uid: string }> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );

    return { ...collection.getMeta(), uid: collection.uid };
  };

  deleteCollection = async (
    collectionUid: string,
    setTask: Dispatch<SetStateAction<Task>>
  ): Promise<boolean> => {
    if (!this.etebaseInstance) throw new Error("No store instance");
    if (setTask)
      setTask({
        description: "Delete project",
        isLoading: true,
        progress: 0,
      });
    try {
      const collectionManager = this.etebaseInstance.getCollectionManager();

      const collection = await collectionManager.fetch(collectionUid);

      if (setTask)
        setTask((task) => ({
          ...task,
          progress: 50,
        }));

      collection.delete();

      await collectionManager.upload(collection);

      if (setTask)
        setTask((task) => ({
          ...task,
          isLoading: false,
          progress: 100,
        }));

      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  getCollectionMembers = async (
    collectionUid: string
  ): Promise<ProjectMember[] | null> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const invitationManager = this.etebaseInstance.getInvitationManager();

    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const memberManager = collectionManager.getMemberManager(collection);
    const members = await memberManager.list();
    const invitations = await invitationManager.listOutgoing();

    return this.reshapeMembers(collectionUid, members?.data, invitations?.data);
  };

  reshapeMembers = (
    collectionUid: string,
    collectionMembers: CollectionMember[],
    collectionInvitedMembers: SignedInvitationRead[]
  ): ProjectMember[] =>
    collectionMembers
      .map(({ username, accessLevel }) => ({
        username,
        isPending: false,
        accessLevel,
      }))
      .concat(
        collectionInvitedMembers
          .filter((item) => item.collection === collectionUid)
          .filter((item, i, array) => array.indexOf(item) === i) // filter out duplicats
          .map(({ username, accessLevel }) => ({
            username,
            isPending: true,
            accessLevel,
          }))
      );

  getCollectionsMembers = async (
    type = "gliff.gallery"
  ): Promise<{
    [uid: string]: ProjectMember[];
  }> => {
    if (!this.etebaseInstance) throw new Error("No store instance");

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const invitationManager = this.etebaseInstance.getInvitationManager();
    const { data } = await collectionManager.list(type);

    const resolved: {
      [uid: string]: ProjectMember[];
    } = {};

    await Promise.allSettled(
      data
        .filter((collection) => !collection.isDeleted)
        .map(async (collection) => {
          const memberManager = collectionManager.getMemberManager(collection);
          const members = await memberManager.list();
          const invitations = await invitationManager.listOutgoing();

          return {
            uid: collection.uid,
            data: this.reshapeMembers(
              collection.uid,
              members?.data,
              invitations?.data
            ),
          };
        })
    ).then((results) =>
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          resolved[result.value.uid] = result.value.data;
        }
      })
    );

    return resolved;
  };

  createCollection = async ({
    name,
    description,
  }: {
    name: string;
    description?: string;
  }): Promise<string> => {
    const collectionManager = this.etebaseInstance.getCollectionManager();

    // Create, encrypt and upload a new collection
    const collection = await collectionManager.create<GalleryMeta>(
      "gliff.gallery", // type
      {
        type: "gliff.gallery",
        meta_version: 0,
        content_version: 0,
        name,
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        description: description || "",
        defaultLabels: [],
        restrictLabels: false,
        multiLabel: true,
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const memberManager = collectionManager.getMemberManager(collection);
    await memberManager.remove(username);

    await this.removeAssignee(collectionUid, username);
  };

  createImage = async (
    collectionUid: string,
    imageFileInfos: ImageFileInfo[],
    thumbnails: string[],
    imageContents: string[] | Uint8Array[],
    setTask: Dispatch<SetStateAction<Task>>,
    imageLabels: string[][] | null = null,
    maxBatchSize = 3000000
  ): Promise<GalleryTile[] | null> => {
    // Create/upload new gliff.image items to STORE.
    if (!this.etebaseInstance) throw new Error("No store instance");

    try {
      setTask((prevTask) => ({
        ...prevTask,
        progress: 10,
        description: "Fetching collection...",
      }));

      // fetch the collectionManager, the collection and the itemManager
      const collectionManager = this.etebaseInstance.getCollectionManager();
      const collection = await this.fetchCollection(
        collectionManager,
        collectionUid
      );
      const itemManager = collectionManager.getItemManager(collection);

      setTask((prevTask) => ({
        ...prevTask,
        progress: 20,
        description: "Creating image items...",
      }));
      await new Promise((resolve) => setTimeout(resolve, 50)); // gives the snackbar time to re-render

      // create new image items and the new gallery tiles
      const newItems: Item[] = [];
      const newTiles: GalleryTile[] = [];
      const createdTime = new Date().getTime();
      await Promise.allSettled(
        imageFileInfos.map(async (imageFileInfo, i) => {
          const result = await itemManager.create<ImageMeta>(
            {
              type: "gliff.image",
              meta_version: 0,
              content_version: 0,
              name: imageFileInfo.fileName,
              createdTime,
              modifiedTime: createdTime,
              fileInfo: imageFileInfo,
            },
            imageContents[i]
          );
          return result;
        })
      ).then(async (results) => {
        setTask((prevTask) => ({
          ...prevTask,
          progress: 30,
          description: "Creating new tiles...",
        }));
        await new Promise((resolve) => setTimeout(resolve, 50)); // gives the snackbar time to re-render
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            const newItem = result.value;

            newItems.push(newItem);

            newTiles.push({
              id: newItem.uid,
              thumbnail: thumbnails[i],
              imageLabels: imageLabels ? imageLabels[i] : [],
              assignees: [],
              fileInfo: imageFileInfos[i],
              imageUID: newItem.uid,
              annotationUID: {},
              annotationComplete: {},
              auditUID: {},
            });
          } else {
            console.error(
              `couldn't create item for image ${imageFileInfos[i].fileName}`
            );
          }
        });
      });

      setTask((prevTask) => ({
        ...prevTask,
        progress: 35,
        description: "Batching images...",
      }));
      await new Promise((resolve) => setTimeout(resolve, 50)); // gives the snackbar time to re-render

      let itemsUploadPromise;
      const numOfImages = imageFileInfos.length;
      if (numOfImages > 1) {
        const startOfBatch = [0];
        let currBarch = imageFileInfos[0].size;
        for (let i = 1; i < numOfImages; i += 1) {
          if (currBarch + imageFileInfos[i].size > maxBatchSize) {
            startOfBatch.push(i);
            currBarch = 0;
          }
          currBarch += imageFileInfos[i].size;
        }
        startOfBatch.push(numOfImages);

        // create promise for uploading all image items to STORE
        itemsUploadPromise = Promise.all(
          startOfBatch.map(async (index, i) => {
            const result = await itemManager.batch(
              newItems.slice(index, startOfBatch[i + 1])
            );
            return result;
          })
        );
      } else {
        // create promise for uploading all image items to STORE
        itemsUploadPromise = itemManager.batch(newItems);
      }

      setTask((prevTask) => ({
        ...prevTask,
        progress: 40,
        description: "Updating collection...",
      }));
      await new Promise((resolve) => setTimeout(resolve, 50)); // gives the snackbar time to re-render

      // add the new gallery tiles to the gliff.gallery's content and update the content
      const galleryUploadPromise = new Promise((resolve, reject) => {
        (async (): Promise<void> => {
          const oldContent = await collection.getContent(OutputFormat.String);

          const newContent = JSON.stringify(
            (JSON.parse(oldContent) as GalleryTile[]).concat(newTiles)
          );

          await collection.setContent(newContent);

          await collectionManager.transaction(collection);
        })()
          .then(() => resolve(undefined))
          .catch((e) => {
            console.error(e);
            reject();
          });
      });

      setTask((prevTask) => ({
        ...prevTask,
        progress: 50,
        description: "Uploading...",
      }));

      // resolve all promises: upload all the new items and update the gallery
      await Promise.all([itemsUploadPromise, galleryUploadPromise]);

      setTask((prevTask) => ({
        ...prevTask,
        description: "Upload complete",
        progress: 100,
      }));
      await new Promise((resolve) => setTimeout(resolve, 100)); // gives the snackbar time to re-render

      return newTiles;
    } catch (err) {
      logger.error(err);
      return null;
    }
  };

  setImageLabels = async (
    collectionUid: string,
    imageUid: string,
    newLabels: string[]
  ): Promise<void> => {
    // get gallery items metadata from gallery collection:
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
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
    const allItems: Item[] = await this.fetchMulti(
      itemManager,
      imageUIDs.concat(annotationUIDs).concat(auditUIDs)
    );

    setTask({ isLoading: true, description: "Image deletion", progress: 75 });

    allItems.forEach((item) => {
      item.delete();
    });

    await itemManager.batch(allItems);

    setTask({ isLoading: false, description: "Image deletion", progress: 100 });
  };

  removeAssignee = async (
    collectionUid: string,
    username: string
  ): Promise<void> => {
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const content = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];
    const galleryTile = content.find((item) => item.imageUID === imageUid);

    if (
      !galleryTile?.annotationUID ||
      galleryTile.annotationUID[username] === undefined
    )
      return null;

    const annotationItem = await this.fetchItem(
      collectionManager.getItemManager(collection),
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
  ): Promise<{ meta: AnnotationMeta[][]; annotations: Annotation[][][] }> => {
    // retrieves the Annotations objects for all images by all users

    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const tiles = JSON.parse(
      await collection.getContent(OutputFormat.String)
    ) as GalleryTile[];

    const annotationUIDs = ([] as string[]).concat(
      ...tiles.map((tile) => Object.values(tile.annotationUID))
    ); // [im0_ann0, im0_ann1, im0_ann2, im1_ann0, im1_ann1, ...]
    const annotationItems = await this.fetchMulti(
      collectionManager.getItemManager(collection),
      annotationUIDs
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

  preMigrate = async (
    etebaseObject: Collection | Item
  ): Promise<Collection | Item> => {
    // migrates a versionless etebase object of unknown structure to V0 of whatever type it is
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const meta: any = etebaseObject.getMeta();

    if (!("type" in meta)) {
      // pre-migration-system Gallery collections don't have a type field in metadata, because we thought we didn't need it
      // since collections have type as a required argument on creation
      // but it turns out collection.type isn't a thing, it only works through collectionManager.list
      // Galleries are the only etebase objects we use that don't have a type field, so we can assume that this collection is a gallery:
      meta.type = "gliff.gallery";
    }
    if ((meta as ItemMetadata).type === "gliff.gallery") {
      const content = JSON.parse(
        await etebaseObject.getContent(OutputFormat.String)
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

      await etebaseObject.setContent(JSON.stringify(content));
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

    (meta as BaseMeta).meta_version = 0;
    (meta as BaseMeta).content_version = 0;

    etebaseObject.setMeta(meta);

    return etebaseObject;

    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  };

  correctPluginModifications = async (
    manager: CollectionManager | ItemManager,
    etebaseObject: Collection | Item
  ): Promise<void> => {
    // corrects modifications made by plugins that deviate from the interfaces
    // should become obsolete once we learn how to import the interfaces into the gliff-sdk

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const meta = etebaseObject.getMeta<BaseMeta>();
    let content;
    try {
      content = JSON.parse(
        await etebaseObject.getContent(OutputFormat.String)
      ) as any[];
    } catch (e) {
      console.error(
        `Failed to parse JSON content of ${
          etebaseObject.uid
        }: ${await etebaseObject.getContent(OutputFormat.String)}`
      );
    }

    let migrate = false;
    if (meta.type === "gliff.gallery") {
      for (let i = 0; i < content.length; i += 1) {
        if (!("fileInfo" in content[i]) && "metadata" in content[i]) {
          // rename tile.metadata -> tile.fileInfo
          content[i].fileInfo = content[i].metadata;
          migrate = true;
        }
        if (
          "imageName" in content[i].fileInfo &&
          !("fileName" in content[i].fileInfo)
        ) {
          // rename imageName -> fileName
          content[i].fileInfo.fileName = content[i].fileInfo.imageName;
          migrate = true;
        }
      }
    } else if (meta.type === "gliff.image") {
      if ("imageName" in meta && !("name" in meta)) {
        (meta as ImageMeta).name = (meta as any).imageName;
        migrate = true;
      }
    }
    if (migrate) {
      etebaseObject.setMeta(meta);
      await etebaseObject.setContent(JSON.stringify(content));
      if (manager instanceof CollectionManager) {
        await manager.upload(etebaseObject as Collection);
      } else {
        await manager.batch([etebaseObject as Item]);
      }
    }

    /* eslint-ensable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  };

  migrate = async (
    manager: CollectionManager | ItemManager,
    etebaseObject_: Collection | Item
  ): Promise<Collection | Item> => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    let etebaseObject = etebaseObject_;
    let meta = etebaseObject.getMeta<BaseMeta>();
    let content = "";
    // we catch any errors here and rethrow them, so that Sentry can catch them
    try {
      content = JSON.parse(await etebaseObject.getContent(OutputFormat.String));
    } catch (e) {
      console.error(
        "Looks like your project is corrupted. Please contact the gliff.ai team to fix this - contact@gliff.ai"
      );
    }

    // pre-migrate to V0 if necessary:
    if (!("meta_version" in meta)) {
      etebaseObject = await this.preMigrate(etebaseObject);
      if (manager instanceof CollectionManager) {
        await manager.upload(etebaseObject as Collection);
      } else {
        await manager.batch([etebaseObject as Item]);
      }
      meta = etebaseObject.getMeta<BaseMeta>();
      content = JSON.parse(await etebaseObject.getContent(OutputFormat.String));
    }

    await this.correctPluginModifications(manager, etebaseObject);

    // migrate if necessary:
    let migrate = false;
    const metaCurrentVersion: number = migrations[`${meta.type}.meta`].length;
    const contentCurrentVersion: number =
      migrations[`${meta.type}.content`].length;
    if (meta.meta_version < metaCurrentVersion) {
      // migrate meta:
      console.log(
        `Migrating ${
          meta.type.split(".")[1]
        } metadata to version ${metaCurrentVersion}`
      );
      const outstandingMetaMigrations = migrations[`${meta.type}.meta`].slice(
        meta.meta_version
      );
      for (const migration of outstandingMetaMigrations) {
        meta = migration(meta);
      }
      meta.meta_version = metaCurrentVersion;

      migrate = true;
    }

    if (meta.content_version < contentCurrentVersion) {
      // migrate content:
      console.log(
        `Migrating ${
          meta.type.split(".")[1]
        } content to version ${contentCurrentVersion}`
      );
      const outstandingContentMigrations = migrations[
        `${meta.type}.content`
      ].slice(meta.content_version);
      for (const migration of outstandingContentMigrations) {
        content = migration(content);
      }
      meta.content_version = contentCurrentVersion;

      migrate = true;
    }

    if (migrate) {
      // upload migrated object:
      etebaseObject.setMeta(meta);
      await etebaseObject.setContent(JSON.stringify(content));
      if (manager instanceof CollectionManager) {
        await manager.upload(etebaseObject as Collection);
      } else {
        await manager.batch([etebaseObject as Item]);
      }
    }

    return etebaseObject;

    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  };

  fetchCollection = async (
    manager: CollectionManager,
    uid: string
  ): Promise<Collection> => {
    // fetch collection:
    let etebaseObject = await manager.fetch(uid);
    etebaseObject = (await this.migrate(manager, etebaseObject)) as Collection;
    return etebaseObject;
  };

  fetchItem = async (manager: ItemManager, uid: string): Promise<Item> => {
    // fetch item:
    let etebaseObject = await manager.fetch(uid);
    etebaseObject = (await this.migrate(manager, etebaseObject)) as Item;
    return etebaseObject;
  };

  fetchMulti = async (
    itemManager: ItemManager,
    UIDs: string[]
  ): Promise<Item[]> => {
    if (UIDs.length === 0) {
      // itemManager.fetchMulti will die messily if we pass it an empty UID array
      return [];
    }
    let items = (await itemManager.fetchMulti(UIDs)).data;
    // re-order the retrieved items to the match UIDs:
    items = UIDs.map((uid) => items.find((item) => item.uid === uid) as Item);
    // migrate:
    items = await Promise.all(
      items.map((item) => this.migrate(itemManager, item) as Promise<Item>)
    );
    return items;
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const itemManager = collectionManager.getItemManager(collection);

    // Create new Annotation item
    const createdTime = new Date().getTime();
    const annotationsItem = await itemManager.create<AnnotationMeta>(
      {
        type: "gliff.annotation",
        meta_version: 1,
        content_version: 0,
        mtime: createdTime,
        isComplete,
        createdTime,
      },
      JSON.stringify(annotationData)
    );

    // Create new Audit item:
    const auditItem = await itemManager.create<AuditMeta>(
      {
        type: "gliff.audit",
        meta_version: 0,
        content_version: 0,
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
    await itemManager.batch([annotationsItem, auditItem]);

    if (setTask) {
      setTask({
        isLoading: true,
        description: "Saving annotation...",
        progress: 65,
      });
    }

    // Update collection content JSON:
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    setTask({
      isLoading: true,
      description: "Saving annotation in progress, please wait...",
      progress: 15,
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

    setTask({
      isLoading: true,
      description: "Saving annotation in progress, please wait...",
      progress: 40,
    });

    const annotationUid = tile.annotationUID[username];
    const auditUid = tile.auditUID[username];
    if (!annotationUid || !auditUid) return;

    // Retrieve items
    const itemManager = collectionManager.getItemManager(collection);
    const items = await this.fetchMulti(itemManager, [annotationUid, auditUid]);
    setTask({
      isLoading: true,
      description: "Saving annotation in progress, please wait...",
      progress: 70,
    });

    let annotationItem: Item;
    let auditItem: Item;
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
    await itemManager.batch([annotationItem, auditItem]);
  };

  getItem = async (collectionUid: string, itemUid: string): Promise<Item> => {
    // Retrieve item from a collection.
    const collectionManager = this.etebaseInstance.getCollectionManager();
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const item = await this.fetchItem(
      collectionManager.getItemManager(collection),
      itemUid
    );
    return item;
  };

  getAllImages = async (
    collectionUid: string,
    setTask: ((task: Task) => void) | undefined = undefined
  ): Promise<{ meta: ImageMeta; content: string }[]> => {
    // Retrive all image items from a collection

    const collectionManager = this.etebaseInstance.getCollectionManager();
    if (setTask)
      setTask({
        description: "Fetching image references",
        isLoading: true,
        progress: 0,
      });
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const collectionContent = await collection.getContent(OutputFormat.String);
    const galleryTiles = JSON.parse(collectionContent) as GalleryTile[];
    if (setTask)
      setTask({
        description: "Fetching images",
        isLoading: true,
        progress: 10,
      });

    const imageItems = await this.fetchMulti(
      collectionManager.getItemManager(collection),
      galleryTiles.map((tile) => tile.imageUID)
    );

    if (setTask)
      setTask({
        description: "Decrypting images",
        isLoading: true,
        progress: 30,
      });
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
    const collectionContent = await collection.getContent(OutputFormat.String);
    // get tiles:
    const tiles = JSON.parse(collectionContent) as GalleryTile[];

    // fetch the audits and parse as JSON:
    const auditUIDs = tiles.map((tile) => Object.values(tile.auditUID)).flat();
    if (auditUIDs.length === 0) return [];

    const auditItems = await this.fetchMulti(
      collectionManager.getItemManager(collection),
      auditUIDs
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
    const collection = await this.fetchCollection(
      collectionManager,
      collectionUid
    );
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
