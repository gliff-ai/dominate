import { ReactElement, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import UserInterface, { AnnotationSession } from "@gliff-ai/audit";
import { DominateStore } from "@/store";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  storeInstance: DominateStore;
}

export const AuditWrapper = (props: Props): ReactElement => {
  const { collectionUid } = useParams(); // uid of selected gallery, from URL
  const auth = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AnnotationSession[]>(null);

  const fetchAudit = async () => {
    const sessionsData = await props.storeInstance.getAudits(collectionUid);
    setSessions(sessionsData);
  };

  useEffect(() => {
    // fetch latest ANNOTATE audit from store on page load:
    fetchAudit().catch((err) => {
      console.log(err);
    });
  }, [props.storeInstance.ready]);

  useEffect(() => {
    if (auth.userProfile?.team.tier.id < 2) {
      // no AUDIT on free tier
      navigate("/manage");
    }
  }, [auth.ready]);

  return sessions !== null ? (
    <UserInterface sessions={sessions} showAppBar={false} />
  ) : (
    <></>
  );
};
