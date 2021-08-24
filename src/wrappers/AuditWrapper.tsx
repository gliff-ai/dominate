import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AuditAction } from "@gliff-ai/annotate";
import UserInterface from "@gliff-ai/audit";
import { DominateEtebase } from "@/etebase";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const AuditWrapper = (props: Props): ReactElement => {
  const { collectionUid } = useParams(); // uid of selected gallery, from URL
  const [audit, setAudit] = useState<AuditAction[]>(null);

  const fetchAudit = async () => {
    const auditData: AuditAction[] = await props.etebaseInstance.getLatestAudit(
      collectionUid
    );
    setAudit(auditData);
  };

  useEffect(() => {
    // fetch latest ANNOTATE audit from etebase on page load:
    fetchAudit().catch((err) => {
      console.log(err);
    });
  }, [props.etebaseInstance.ready]);

  return audit !== null ? (
    <UserInterface audit={audit} showAppBar={false} />
  ) : (
    <></>
  );
};
