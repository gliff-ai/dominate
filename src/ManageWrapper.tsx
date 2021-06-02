import { ReactElement } from "react";
import { UserInterface as Manage, ProvideAuth } from "@gliff-ai/manage";
import { DominateEtebase } from "@/etebase";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const ManageWrapper = (props: Props): ReactElement | null => {
  const auth = useAuth();

  if (!props.etebaseInstance || !auth.user) return null;

  const getProjects = async () => {
    const projects = await props.etebaseInstance.getCollectionsMeta();

    return projects;
  };

  const createProject = async ({ name }) => {
    const project = await props.etebaseInstance.createCollection(name);

    return true; // Maybe not always true...
  };

  const services = {
    queryTeam: "GET /team",
    loginUser: "POST /user/login", // Not used, we pass an authd user down
    getProjects,
    createProject,
  };

  const user = { email: auth.user.username, authToken: auth.user.authToken };

  return (
    <ProvideAuth>
      <Manage user={user} services={services} />
    </ProvideAuth>
  );
};
