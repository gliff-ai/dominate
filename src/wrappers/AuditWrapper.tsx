import { ReactElement, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import UserInterface, { AnnotationSession } from "@gliff-ai/audit";
import { DominateStore } from "@/store";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  storeInstance: DominateStore;
}

export const AuditWrapper = (props: Props): ReactElement | null => {
  const { collectionUid = "" } = useParams(); // uid of selected gallery, from URL
  const auth = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AnnotationSession[] | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    const fetchAudit = async () => {
      const sessionsData = await props.storeInstance.getAudits(collectionUid);
      if (!isMounted.current) return; // update state only if component still mounted
      setSessions(sessionsData);
    };

    // fetch latest ANNOTATE audit from store on page load:
    fetchAudit().catch((e) => {
      console.error(e);
    });
  }, [collectionUid, props.storeInstance]);

  useEffect(() => {
    // run at mout
    isMounted.current = true;
    return () => {
      // run at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const tier = auth?.userProfile?.team.tier;
    if (tier && tier.id < 2) {
      // no AUDIT on free tier
      navigate("/manage");
    }
  }, [auth, navigate]);

  if (!auth) return null;
  if (!collectionUid) return null;

  return sessions !== null ? (
    <UserInterface sessions={sessions} showAppBar={false} />
  ) : (
    <></>
  );
};
