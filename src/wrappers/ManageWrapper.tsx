import { ReactElement, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  UserInterface as Manage,
  ProvideAuth /* TODO export Services */,
} from "@gliff-ai/manage";
import { DominateStore, API_URL } from "@/store";
import { useAuth, UserAccess } from "@/hooks/use-auth";
import { inviteNewCollaborator, inviteNewUser } from "@/services/user";
import {
  createTrustedService,
  getTrustedService,
} from "@/services/trustedServices";

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

  const getCollaboratorProject = useCallback(
    async ({ name }) => {
      const projects = await props.storeInstance.getCollectionsMeta();

      // get all members of all team projects
      const membersPromises: Promise<string[] | null>[] = [];
      for (let p = 0; p < projects.length; p += 1) {
        const { uid } = projects[p];
        membersPromises.push(props.storeInstance.getCollectionMembers(uid));
      }
      const allMembers: (string[] | null)[] = await Promise.all<
        string[] | null
      >(membersPromises);

      // for each project, go through members and return the first that matches
      for (let p = 0; p < projects.length; p += 1) {
        const members = allMembers[p];
        if (members) {
          for (let m = 0; p < members.length; m += 1) {
            if (members[m] === name) {
              return projects[p].uid;
            }
          }
        }
      }

      return null;
    },
    [props.storeInstance]
  );

  const createProject = useCallback(
    async ({ name }) => {
      const result = await props.storeInstance.createCollection(name);

      return true; // Maybe not always true...
    },
    [props.storeInstance]
  );

  const inviteUser = useCallback(
    async ({ email }) => {
      // Invite them to create a gliff account
      try {
        const result = await inviteNewUser(email);
      } catch (e) {
        console.log("bad invite");
        console.log(e);
      }

      return true;
      // Share collections with them?
    },
    [inviteNewUser]
  );

  const inviteCollaborator = useCallback(
    async ({ email }) => {
      try {
        // Invite them to create a gliff account
        const result = await inviteNewCollaborator(email);
      } catch (e) {
        console.log("bad invite");
        console.log(e);
      }

      return true;
      // Share collections with them?
    },
    [inviteNewCollaborator]
  );

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

  const addTrustedService = useCallback(
    async ({ url, name }) => {
      // First create a trusted service base user
      const { key, email } =
        await props.storeInstance.createTrustedServiceUser();

      // Set the user profile
      const res = await createTrustedService(email, name, url);

      return key;
    },
    [props.storeInstance, createTrustedService]
  );

  const getTrustedServices = useCallback(async () => {
    const result = await getTrustedService();

    return result;
  }, [getTrustedService]);

  const getAnnotationProgress = async (username: string): Promise<Progress> => {
    const isOwnerOrMember =
      auth?.userAccess === UserAccess.Owner ||
      auth?.userAccess === UserAccess.Member;

    const collectionsContent =
      await props.storeInstance.getCollectionsContent();

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
    getProject: "GET /project/", // TODO
    getCollaboratorProject,
    createProject,
    inviteUser,
    inviteCollaborator,
    inviteToProject,
    createTrustedService: addTrustedService,
    getTrustedServices,
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
