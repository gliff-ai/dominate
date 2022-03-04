import { ReactElement, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import UserInterface, { AnnotationSession } from "@gliff-ai/audit";
import { IconButton, icons } from "@gliff-ai/style";
import { DominateStore } from "@/store";
import { useAuth } from "@/hooks/use-auth";
import { setStateIfMounted } from "@/helpers";
import { ProductNavbarData } from "@/components";

interface Props {
  storeInstance: DominateStore;
  setProductNavbarData: (data: ProductNavbarData) => void;
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
      setStateIfMounted(sessionsData, setSessions, isMounted.current);
    };

    // fetch latest ANNOTATE audit from store on page load:
    fetchAudit().catch((e) => {
      console.error(e);
    });
  }, [collectionUid, props.storeInstance]);

  useEffect(() => {
    // runs at mounted
    isMounted.current = true;
    return () => {
      // runs at dismount
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

  useEffect(() => {
    props.setProductNavbarData({
      teamName: auth?.userProfile?.team.name || "",
      projectName: "",
      imageName: "",
      buttonBack: (
        <IconButton
          onClick={() => navigate("/manage")}
          tooltip={{
            name: `Return to MANAGE `,
          }}
          icon={icons.navigationMANAGE}
        />
      ),
      buttonForward: (
        <IconButton
          onClick={() => navigate(`/curate/${collectionUid}`)}
          tooltip={{
            name: `Return to Curate`,
          }}
          icon={icons.navigationCURATE}
        />
      ),
    });
  }, []);

  if (!auth) return null;
  if (!collectionUid) return null;

  return sessions !== null ? (
    <UserInterface sessions={sessions} showAppBar={false} />
  ) : (
    <></>
  );
};
