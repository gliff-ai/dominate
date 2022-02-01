import { ReactElement, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  UserInterface as Manage,
  ProvideAuth /* TODO export Services */,
} from "@gliff-ai/manage";
import { DominateStore, API_URL } from "@/store";
import { useAuth, UserAccess } from "@/hooks/use-auth";
import { inviteNewCollaborator, inviteNewUser } from "@/services/user";
import { trustedServicesAPI, TrustedService } from "@/services/trustedServices";
import { jsPluginsAPI } from "@/services/plugins";
import { GalleryTile } from "@/store/interfaces";
import { PluginType, Plugin } from "./interfaces";
import { JsPlugin } from "@/services/plugins/interfaces";

type Progress = {
  [uid: string]: { complete: number; total: number };
};

interface Props {
  storeInstance: DominateStore;
}

export const ManageWrapper = (props: Props): ReactElement | null => {
  const auth = useAuth();
  const navigate = useNavigate();

  const getProjects = useCallback(async () => {
    const projects = await props.storeInstance.getCollectionsMeta();

    return projects;
  }, [props.storeInstance]);

  const getProject = useCallback(
    async ({ projectUid }) => {
      const project = await props.storeInstance.getCollectionMeta(projectUid);

      return project;
    },
    [props.storeInstance]
  );

  const getCollectionMembers = useCallback(
    async ({ collectionUid }) => {
      const members = await props.storeInstance.getCollectionMembers(
        collectionUid
      );
      return members;
    },
    [props.storeInstance]
  );

  const createProject = useCallback(
    async ({ name }) => {
      const uid = await props.storeInstance.createCollection(name);

      return uid;
    },
    [props.storeInstance]
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
    async ({ email, projectId }) => {
      const result = await props.storeInstance.inviteUserToCollection(
        projectId,
        email
      );

      return true;
    },
    [props.storeInstance]
  );

  const getPlugins = useCallback(async (): Promise<Plugin[]> => {
    const trustedServices =
      (await trustedServicesAPI.getTrustedService()) as Plugin[];

    const plugins = await jsPluginsAPI.getPlugins();

    return trustedServices.concat(
      plugins.map((p) => ({ ...p, type: "Javascript" })) as Plugin[]
    );
  }, []);

  const getDataAndApiFunc = (
    { type, products, ...rest }: Plugin,
    method: "create" | "update" | "delete"
  ) =>
    type === PluginType.Javascript
      ? {
          data: {
            products: String(products),
            ...rest,
          } as JsPlugin,
          apiFunc: jsPluginsAPI[`${method}Plugin`],
        }
      : {
          data: {
            type: String(type),
            products: String(products),
            ...rest,
          } as Omit<TrustedService, "id">,
          apiFunc: trustedServicesAPI[`${method}TrustedService`],
        };

  const createPlugin = useCallback(async (plugin: Plugin): Promise<
    string | null
  > => {
    const { data, apiFunc } = getDataAndApiFunc(plugin, "create");

    if (plugin.type === PluginType.Javascript) {
      await apiFunc(data);
      return null;
    }
    // First create a trusted service base user
    const { key, email } = await props.storeInstance.createTrustedServiceUser();

    // Set the user profile
    const res = await apiFunc({
      id: email,
      ...data,
    } as TrustedService);

    return key;
  }, []);

  const updatePlugin = useCallback(async (plugin: Plugin): Promise<number> => {
    const { data, apiFunc } = getDataAndApiFunc(plugin, "update");
    return apiFunc(data);
  }, []);

  const deletePlugin = useCallback(async (plugin: Plugin): Promise<number> => {
    const { data, apiFunc } = getDataAndApiFunc(plugin, "delete");
    return apiFunc(data);
  }, []);

  const updateProjectName = useCallback(
    async ({ projectUid, projectName }) => {
      await props.storeInstance.updateCollectionName(projectUid, projectName);

      return true;
    },
    [props.storeInstance]
  );

  const getAnnotationProgress = async (
    username: string,
    collectionUid?: string
  ): Promise<Progress> => {
    const isOwnerOrMember =
      auth?.userAccess === UserAccess.Owner ||
      auth?.userAccess === UserAccess.Member;

    let collectionsContent: {
      uid: string;
      content: GalleryTile[];
    }[];
    if (collectionUid !== undefined) {
      collectionsContent = [
        await props.storeInstance.getCollectionContent(collectionUid),
      ];
    } else {
      collectionsContent = await props.storeInstance.getCollectionsContent();
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
  };

  const getCollectionsMembers = useCallback(async () => {
    const result = await props.storeInstance.getCollectionsMembers();

    const members = {};
    result.forEach(({ uid, usernames, pendingUsernames }) => {
      members[uid] = { usernames, pendingUsernames };
    });

    return members;
  }, [props.storeInstance]);

  const removeFromProject = useCallback(
    async ({ uid, username }): Promise<void> => {
      const result = await props.storeInstance.revokeAccessToCollection(
        uid,
        username
      );
    },
    [props.storeInstance]
  );

  const launchCurate = (projectUid: string): void =>
    // Open the selected project in curate
    navigate(`/curate/${projectUid}`);

  const launchAudit = (projectUid: string): void =>
    // Open the selected project in audit
    navigate(`/audit/${projectUid}`);

  // These require trailing slashes otherwise Safari won't send the Auth Token (as django will 301)
  const services = {
    queryTeam: "GET /team/",
    loginUser: "POST /user/login", // Not used, we pass an authd user down
    getProjects,
    getProject,
    getCollectionMembers,
    getCollectionsMembers,
    createProject,
    updateProjectName,
    inviteUser,
    inviteCollaborator,
    inviteToProject,
    removeFromProject,
    createPlugin,
    getPlugins,
    updatePlugin,
    deletePlugin,
  };

  if (!auth || !props.storeInstance || !auth.user || !auth.userProfile)
    return null;

  const user = {
    email: auth.user.username,
    authToken: auth.user.authToken,
    userAccess: auth.userAccess,
    tierID: auth?.userProfile.team.tier.id,
  };

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
        getAnnotationProgress={getAnnotationProgress}
      />
    </ProvideAuth>
  );
};
