import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import UserInterface, { AnnotationSession } from "@gliff-ai/audit";
import { DominateEtebase } from "@/etebase";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const AuditWrapper = (props: Props): ReactElement => {
  const { collectionUid } = useParams(); // uid of selected gallery, from URL
  const [sessions, setSessions] = useState<AnnotationSession[]>(null);

  const fetchAudit = async () => {
    const sessionsData = await props.etebaseInstance.getAudits(collectionUid);
    setSessions(sessionsData);
  };

  useEffect(() => {
    // fetch latest ANNOTATE audit from etebase on page load:
    fetchAudit().catch((err) => {
      console.log(err);
    });
  }, [props.etebaseInstance.ready]);

  return sessions !== null ? (
    <UserInterface sessions={sessions} showAppBar={false} />
  ) : (
    <></>
  );
};
