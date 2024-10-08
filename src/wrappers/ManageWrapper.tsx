import {
  ReactElement,
  SetStateAction,
  useCallback,
  Dispatch,
  useMemo,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  UserInterface as Manage,
  ProvideAuth /* TODO export Services */,
} from "@gliff-ai/manage";
import { ImageFileInfo } from "@gliff-ai/upload";
import { Task } from "@gliff-ai/style";
import { DominateStore, API_URL, DEMO_DATA_URL } from "@/store";
import { useAuth } from "@/hooks/use-auth";
import {
  inviteNewCollaborator,
  inviteNewUser,
  UserAccess,
  deleteExistingInvite,
} from "@/services/user";
import {
  trustedServicesAPI,
  TrustedServiceOut,
} from "@/services/trustedServices";
import { jsPluginsAPI, JsPlugin } from "@/services/plugins";
import { ProductNavbarData } from "@/components";
import { FileInfo, GalleryTile, DemoMetadata, GalleryMeta } from "@/interfaces";
import { PluginType, Plugin } from "@/plugins";
import { loadNonTiffImageFromURL } from "@/imageConversions";
import { PluginWithExtra } from "@/plugins/interfaces";

type Progress = {
  [uid: string]: { complete: number; total: number };
};

interface Props {
  storeInstance: DominateStore;
  setProductNavbarData: (data: ProductNavbarData) => void;
  setTask: Dispatch<SetStateAction<Task>>;
}

export const ManageWrapper = ({
  storeInstance,
  setTask,
  setProductNavbarData,
}: Props): ReactElement | null => {
  const auth = useAuth();
  const navigate = useNavigate();

  const getProjects = useCallback(async (): Promise<GalleryMeta[]> => {
    const projects = await storeInstance.getCollectionsMeta();

    return projects;
  }, [storeInstance]);

  const getProject = useCallback(
    async ({ projectUid }) => {
      const project = await storeInstance.getCollectionMeta(projectUid);

      return project;
    },
    [storeInstance]
  );

  const deleteProject = useCallback(
    async ({ projectUid }): Promise<boolean> => {
      const result = await storeInstance.deleteCollection(projectUid, setTask);

      return result;
    },
    [storeInstance]
  );

  const createProject = useCallback(
    async (projectDetails: { name: string; description?: string }) => {
      const uid = await storeInstance.createCollection(projectDetails);

      return uid;
    },
    [storeInstance]
  );

  const inviteUser = useCallback(async ({ email }) => {
    // Invite them to create a gliff account

    const result = await inviteNewUser(email);

    return true;
    // Share collections with them?
  }, []);

  const inviteCollaborator = useCallback(async ({ email }) => {
    // Invite them to create a gliff account
    const result = await inviteNewCollaborator(email);

    return true;
    // Share collections with them?
  }, []);

  const deleteInvite = useCallback(async ({ email }) => {
    // Delete an existing invite
    const result = await deleteExistingInvite(email);

    return true;
  }, []);

  const inviteToProject = useCallback(
    async ({ projectUid, email }) => {
      const result = await storeInstance.inviteUserToCollection(
        projectUid,
        email
      );

      return true;
    },
    [storeInstance]
  );

  const getPlugins = useCallback(async (): Promise<PluginWithExtra[]> => {
    let allPlugins: PluginWithExtra[] = [];

    try {
      const trustedServices =
        (await trustedServicesAPI.getTrustedService()) as PluginWithExtra[];
      allPlugins = allPlugins.concat(trustedServices);
    } catch (e) {
      console.error(e);
    }

    try {
      const jsplugins = (await jsPluginsAPI.getPlugins()).map((p) => ({
        ...p,
        collection_uids: p.collection_uids.map((uid) => ({
          uid,
          is_invite_pending: false,
        })),
      })) as PluginWithExtra[];
      allPlugins = allPlugins.concat(jsplugins);
    } catch (e) {
      console.error(e);
    }

    return allPlugins;
  }, []);

  const createPlugin = useCallback(
    async (plugin: Plugin): Promise<{ key: string; email: string } | null> => {
      if (plugin.type === PluginType.Javascript) {
        await jsPluginsAPI.createPlugin(plugin as JsPlugin);
        return null;
      }
      // First create a trusted service base user
      const { key, email } = await storeInstance.createTrustedServiceUser();

      // Set the user profile
      const res = await trustedServicesAPI.createTrustedService({
        username: email,
        ...plugin,
      } as TrustedServiceOut);

      return { key, email };
    },
    [storeInstance]
  );

  const updatePlugin = useCallback(async (plugin: Plugin): Promise<number> => {
    if (plugin.type === PluginType.Javascript) {
      return jsPluginsAPI.updatePlugin(plugin as JsPlugin);
    }
    return trustedServicesAPI.updateTrustedService(plugin as TrustedServiceOut);
  }, []);

  const deletePlugin = useCallback(async (plugin: Plugin): Promise<number> => {
    if (plugin.type === PluginType.Javascript) {
      return jsPluginsAPI.deletePlugin(plugin as JsPlugin);
    }
    return trustedServicesAPI.deleteTrustedService(plugin as TrustedServiceOut);
  }, []);

  const getAnnotationProgress = useCallback(
    async ({
      username,
      projectUid,
    }: {
      username: string;
      projectUid?: string;
    }): Promise<Progress> => {
      const isOwnerOrMember =
        auth?.userAccess === UserAccess.Owner ||
        auth?.userAccess === UserAccess.Member;

      let collectionsContent: {
        uid: string;
        content: GalleryTile[];
      }[];

      if (projectUid !== undefined) {
        collectionsContent = [
          await storeInstance.getCollectionContent(projectUid),
        ];
      } else {
        collectionsContent = await storeInstance.getCollectionsContent();
      }

      const progress: Progress = {};

      collectionsContent.forEach(({ uid, content }) => {
        progress[uid] = { complete: 0, total: 0 };

        content.forEach(({ assignees = [], annotationComplete = {} }) => {
          if (assignees.length === 0) return;

          // NOTE: '|| 0' was added to handle the case of images assigned before
          // the 'annotationComplete' field was added to the GalleryTile interface.
          if (isOwnerOrMember) {
            progress[uid].total += assignees.length;
            progress[uid].complete += assignees
              .map((assignee) => Number(annotationComplete[assignee]) || 0)
              .concat([0]) // added to handle case of unassigned images
              .reduce((a, b) => a + b);
          } else {
            progress[uid].total += 1;
            progress[uid].complete += Number(annotationComplete[username]) || 0;
          }
        });
      });
      return progress;
    },
    [auth?.userAccess, storeInstance]
  );

  const getCollectionMembers = useCallback(
    async ({ collectionUid }) => {
      const result = await storeInstance.getCollectionMembers(collectionUid);

      return result;
    },
    [storeInstance]
  );

  const getCollectionsMembers = useCallback(async () => {
    const result = await storeInstance.getCollectionsMembers();

    return result;
  }, [storeInstance]);

  const removeFromProject = useCallback(
    async ({ projectUid, email }): Promise<void> => {
      const result = await storeInstance.revokeAccessToCollection(
        projectUid,
        email
      );
    },
    [storeInstance]
  );

  const launchCurate = useCallback(
    (projectUid: string): void =>
      // Open the selected project in curate
      navigate(`/curate/${projectUid}`),
    [navigate]
  );

  const launchAudit = useCallback(
    (projectUid: string): void =>
      // Open the selected project in audit
      navigate(`/audit/${projectUid}`),
    [navigate]
  );

  const launchDocs = useCallback(
    () => window.open("https://docs.gliff.app/", "_blank"),
    []
  );

  const incrementTaskProgress = useCallback(
    (increment: number) => () => {
      setTask((prevTask) => ({
        ...prevTask,
        progress: (prevTask.progress as number) + increment,
      }));
    },
    [setTask]
  );

  const updateProjectDetails = useCallback(
    async ({
      projectUid,
      projectDetails,
    }: {
      projectUid: string;
      projectDetails: { name?: string; description?: string };
    }): Promise<boolean> => {
      const result = await storeInstance.updateCollectionMeta(
        projectUid,
        projectDetails
      );

      return result;
    },
    [storeInstance]
  );

  const downloadDemoData = useCallback(async (): Promise<string | null> => {
    setTask({
      isLoading: true,
      description: "Downloading demo data.",
      progress: 0,
    });

    let projectUid: string | null = null;
    try {
      // create a new project
      projectUid = await storeInstance.createCollection({
        name: "Giraffes-Hippos Demo",
      });

      // fetch the metadata
      const metadata: DemoMetadata[] = (await (
        await fetch(`${DEMO_DATA_URL}/metadata.json`)
      ).json()) as DemoMetadata[];

      const progressIncrement = Math.round(40 / (metadata.length * 2));
      const fileInfos: ImageFileInfo[] = [];
      const imageContents: string[] = [];
      const allImageLabels: string[][] = [];
      const thumbnails: string[] = [];

      incrementTaskProgress(5);

      // loop through the matadata and load all the images
      await Promise.allSettled(
        metadata.map(async (imeta): Promise<{
          imageFileInfo: DemoMetadata["fileInfo"];
          thumbnail: string;
          imageContent: string;
        }> => {
          const result = await loadNonTiffImageFromURL(
            `${DEMO_DATA_URL}/${imeta?.fileInfo?.fileName as string}`,
            imeta?.fileInfo,
            incrementTaskProgress(progressIncrement)
          );
          return result;
        })
      ).then((results) =>
        results.forEach((result, i) => {
          if (result?.status === "fulfilled" && result?.value) {
            const { imageFileInfo, thumbnail, imageContent } = result.value;

            fileInfos.push(imageFileInfo as FileInfo);
            thumbnails.push(thumbnail);
            imageContents.push(imageContent);
            allImageLabels.push(metadata[i].imageLabels);
          }
        })
      );

      // upload the images to STORE
      await storeInstance.createImage(
        projectUid,
        fileInfos,
        thumbnails,
        imageContents,
        setTask,
        allImageLabels
      );

      setTask({
        isLoading: false,
        description: "Downloading demo data.",
        progress: 100,
      });
    } catch (e) {
      console.error(e);
    }
    return projectUid;
  }, [storeInstance, setTask, incrementTaskProgress]);

  const services = useMemo(
    () => ({
      queryTeam: "GET /team/",
      loginUser: "POST /user/login", // Not used, we pass an authd user down
      getProjects,
      getProject,
      deleteProject,
      getCollectionMembers,
      getCollectionsMembers,
      createProject,
      updateProjectDetails,
      inviteUser,
      inviteCollaborator,
      deleteInvite,
      inviteToProject,
      removeFromProject,
      createPlugin,
      getPlugins,
      updatePlugin,
      deletePlugin,
      getAnnotationProgress,
      launchDocs,
      downloadDemoData,
    }),
    [
      getProjects,
      getProject,
      deleteProject,
      getCollectionMembers,
      getCollectionsMembers,
      createProject,
      updateProjectDetails,
      inviteUser,
      inviteCollaborator,
      deleteInvite,
      inviteToProject,
      removeFromProject,
      createPlugin,
      getPlugins,
      updatePlugin,
      deletePlugin,
      getAnnotationProgress,
      launchDocs,
      downloadDemoData,
    ]
  );

  const user = useMemo(
    () => ({
      email: auth?.user?.username,
      authToken: auth?.user?.authToken,
      userAccess: auth?.userAccess,
      tierID: auth?.userProfile?.team?.tier?.id,
    }),
    [auth]
  );

  useEffect(() => {
    setProductNavbarData({
      teamName: auth?.userProfile?.team.name || "",
      projectName: "",
      imageName: "",
      buttonBack: null,
      buttonForward: null,
      productLocation: "MANAGE",
    });
  }, []);

  if (!storeInstance || !auth?.user || !auth?.userProfile) return null;

  return (
    <ProvideAuth>
      <Manage
        user={user}
        services={services}
        apiUrl={API_URL}
        launchCurateCallback={launchCurate}
        launchAuditCallback={
          auth?.userProfile.team.tier.id > 1 ? launchAudit : null
        }
      />
    </ProvideAuth>
  );
};
