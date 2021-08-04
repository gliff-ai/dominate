import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import {
  UserInterface as Manage,
  ProvideAuth /* TODO export Services */,
} from "@gliff-ai/manage";
import { DominateEtebase } from "@/etebase";
import { useAuth } from "@/hooks/use-auth";
import { inviteNewCollaborator, inviteNewUser } from "@/services/user";

declare const STORE_URL: string;
export const API_URL = `${STORE_URL}django/api`;

interface Props {
  etebaseInstance: DominateEtebase;
}

export const ManageWrapper = (props: Props): ReactElement | null => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!props.etebaseInstance || !auth.user) return null;

  const getProjects = async () => {
    const projects = await props.etebaseInstance.getCollectionsMeta();

    return projects;
  };

  const createProject = async ({ name }) => {
    const project = await props.etebaseInstance.createCollection(name);

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
    const result = await props.etebaseInstance.inviteUserToCollection(
      projectId,
      email
    );

    return true;
  };

  const launchCurate = (projectUid: string): void =>
    // Open the selected project in curate
    navigate(`/curate/${projectUid}`);

  // These require trailing slashes otherwise Safari won't send the Auth Token (as django will 301)
  const services = {
    queryTeam: "GET /team/",
    loginUser: "POST /user/login", // Not used, we pass an authd user down
    getProjects,
    getProject: "GET /project/", // TODO
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
      />
    </ProvideAuth>
  );
};
