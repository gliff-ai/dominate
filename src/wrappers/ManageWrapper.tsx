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
    async ({ projectUid, email }) => {
      const result = await props.storeInstance.inviteUserToCollection(
        projectUid,
        email
      );

      return true;
    },
    [props.storeInstance]
  );

  const getPlugins = useCallback(async (): Promise<Plugin[]> => {
    let allPlugins: Plugin[] = [];

    try {
      const trustedServices =
        (await trustedServicesAPI.getTrustedService()) as Plugin[];
      allPlugins = allPlugins.concat(trustedServices);
    } catch (e) {
      console.error(e);
    }

    try {
      const jsplugins = (await jsPluginsAPI.getPlugins()) as Plugin[];
      allPlugins = allPlugins.concat(jsplugins);
    } catch (e) {
      console.error(e);
    }

    return allPlugins;
  }, []);

  const createPlugin = useCallback(
    async (plugin: Plugin): Promise<string | null> => {
      if (plugin.type === PluginType.Javascript) {
        await jsPluginsAPI.createPlugin(plugin as JsPlugin);
        return null;
      }
      // First create a trusted service base user
      const { key, email } =
        await props.storeInstance.createTrustedServiceUser();

      // Set the user profile
      const res = await trustedServicesAPI.createTrustedService({
        username: email,
        ...plugin,
      } as TrustedService);

      return key;
    },
    [props.storeInstance]
  );

  const updatePlugin = useCallback(async (plugin: Plugin): Promise<number> => {
    if (plugin.type === PluginType.Javascript) {
      return jsPluginsAPI.updatePlugin(plugin as JsPlugin);
    }
    return trustedServicesAPI.updateTrustedService(plugin as TrustedService);
  }, []);

  const deletePlugin = useCallback(async (plugin: Plugin): Promise<number> => {
    if (plugin.type === PluginType.Javascript) {
      return jsPluginsAPI.deletePlugin(plugin as JsPlugin);
    }
    return trustedServicesAPI.deleteTrustedService(plugin as TrustedService);
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
    async ({ projectUid, email }): Promise<void> => {
      const result = await props.storeInstance.revokeAccessToCollection(
        projectUid,
        email
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
