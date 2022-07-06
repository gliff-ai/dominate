import {
  ReactElement,
  SetStateAction,
  useCallback,
  Dispatch,
  useMemo,
  useState,
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
} from "@/services/user";
import {
  getPlugins,
  updatePlugin,
  createPlugin,
  deletePlugin,
} from "@/services/plugins";
import { FileInfo, GalleryTile, DemoMetadata, GalleryMeta } from "@/interfaces";
import { Plugin } from "@/plugins";
import { loadNonTiffImageFromURL } from "@/imageConversions";
import { ZooDialog } from "@/components";

type Progress = {
  [uid: string]: { complete: number; total: number };
};

interface Props {
  storeInstance: DominateStore;
  setTask: Dispatch<SetStateAction<Task>>;
}

export const ManageWrapper = ({
  storeInstance,
  setTask,
}: Props): ReactElement | null => {
  const auth = useAuth();
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);
  const [rerender, setRerender] = useState<number>(0);
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
      const uid = await storeInstance.createGallery(projectDetails);

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
      projectUid = await storeInstance.createGallery({
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

  const rerenderWrapper = useCallback(
    (func: (plugin: Plugin) => Promise<unknown>) =>
      async (plugin: Plugin): Promise<unknown> => {
        const res = await func(plugin);
        setRerender((count) => count + 1);
        return res;
      },
    [setRerender]
  );

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
      inviteToProject,
      removeFromProject,
      createPlugin: rerenderWrapper(createPlugin(storeInstance)),
      getPlugins,
      updatePlugin: rerenderWrapper(updatePlugin),
      deletePlugin: rerenderWrapper(deletePlugin),
      getAnnotationProgress,
      launchDocs,
      downloadDemoData,
    }),
    [
      storeInstance,
      getProjects,
      getProject,
      deleteProject,
      getCollectionMembers,
      getCollectionsMembers,
      createProject,
      updateProjectDetails,
      inviteUser,
      inviteCollaborator,
      inviteToProject,
      removeFromProject,
      getAnnotationProgress,
      launchDocs,
      downloadDemoData,
      rerenderWrapper,
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
    // get plugins data (should run once at mount)
    void getPlugins().then(setPlugins);
  }, [rerender]);

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
        ZooDialog={<ZooDialog plugins={plugins} datasets={[]} />}
      />
    </ProvideAuth>
  );
};
