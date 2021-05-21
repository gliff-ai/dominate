import { UserInterface as Manage, ProvideAuth } from "@gliff-ai/manage";

import { DominateEtebase } from "@/etebase";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const ManageWrapper = (props: Props) => {
  const auth = useAuth();

  if (!props.etebaseInstance || !auth.user) return null;

  const user = { email: auth.user.username, authToken: auth.user.authToken };

  return (
    <ProvideAuth>
      <Manage user={user} />
    </ProvideAuth>
  );
};
