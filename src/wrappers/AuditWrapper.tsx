import { ReactElement, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import UserInterface, { AnnotationSession } from "@gliff-ai/audit";
import { DominateStore } from "@/store";
import { useAuth } from "@/hooks/use-auth";
import { setStateIfMounted } from "@/helpers";

interface Props {
  storeInstance: DominateStore;
}

export const AuditWrapper = ({ storeInstance }: Props): ReactElement | null => {
  const { collectionUid = "" } = useParams(); // uid of selected gallery, from URL
  const auth = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AnnotationSession[] | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    // fetch audit data (should run once at mount)
    const fetchAudit = async () => {
      const sessionsData = await storeInstance.getAudits(collectionUid);
      setStateIfMounted(sessionsData, setSessions, isMounted.current);
    };

    // fetch latest ANNOTATE audit from store on page load:
    fetchAudit().catch((e) => {
      console.error(e);
    });
  }, [collectionUid, storeInstance, isMounted.current]);

  useEffect(() => {
    const tier = auth?.userProfile?.team.tier;
    if (tier && tier.id < 2) {
      // no AUDIT on free tier
      navigate("/manage");
    }
  }, [auth?.userProfile?.team.tier, navigate]);

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  if (!auth || !collectionUid || sessions === null) return null;

  return <UserInterface sessions={sessions} showAppBar={false} />;
};
