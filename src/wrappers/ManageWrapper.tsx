import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import {
  UserInterface as Manage,
  ProvideAuth /* TODO export Services */,
} from "@gliff-ai/manage";
import { DominateStore } from "@/store";
import { useAuth } from "@/hooks/use-auth";
import { inviteNewCollaborator, inviteNewUser } from "@/services/user";

declare const STORE_URL: string;
export const API_URL = `${STORE_URL}django/api`;

interface Props {
  storeInstance: DominateStore;
}

export const ManageWrapper = (props: Props): ReactElement | null => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!props.storeInstance || !auth.user) return null;

  const getProjects = async () => {
    const projects = await props.storeInstance.getCollectionsMeta();

    return projects;
  };

  const getCollaboratorProject = async ({ name }) => {
    const projects = await props.storeInstance.getCollectionsMeta();

    // get all members of all team projects
    const membersPromises = [];
    for (let p = 0; p < projects.length; p += 1) {
      const { uid } = projects[p];
      membersPromises.push(props.storeInstance.getCollectionMembers(uid));
    }
    const allMembers: string[][] = await Promise.all<string[]>(membersPromises);

    // for each project, go through members and return the first that matches
    for (let p = 0; p < projects.length; p += 1) {
      const members = allMembers[p];
      for (let m = 0; p < members.length; m += 1) {
        if (members[m] === name) {
          return projects[p].uid;
        }
      }
    }

    return null;
  };

  const createProject = async ({ name }) => {
    const result = await props.storeInstance.createCollection(name);

    return true; // Maybe not always true...
  };

  const inviteUser = async ({ email }) => {
    // Invite them to create a gliff account
    const result = await inviteNewUser(email);

    return true;
    // Share collections with them?
  };

  const inviteCollaborator = async ({ email }) => {
    // Invite them to create a gliff account
    const result = await inviteNewCollaborator(email);

    return true;
    // Share collections with them?
  };

  const inviteToProject = async ({ email, projectId }) => {
    const result = await props.storeInstance.inviteUserToCollection(
      projectId,
      email
    );

    return true;
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
  };

  const user = { email: auth.user.username, authToken: auth.user.authToken };

  return (
    <ProvideAuth>
      <Manage
        user={user}
        services={services}
        apiUrl={API_URL}
        launchCurateCallback={launchCurate}
        launchAuditCallback={
          auth.userProfile.team.tier.id > 1 ? launchAudit : null
        }
      />
    </ProvideAuth>
  );
};
