import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AuditAction } from "@gliff-ai/annotate";
import UserInterface from "@gliff-ai/audit";
import { DominateStore } from "@/store";

interface Props {
  storeInstance: DominateStore;
}

export const AuditWrapper = (props: Props): ReactElement => {
  const { collectionUid } = useParams(); // uid of selected gallery, from URL
  const [audit, setAudit] = useState<AuditAction[]>(null);

  const fetchAudit = async () => {
    const auditData: AuditAction[] = await props.storeInstance.getLatestAudit(
      collectionUid
    );
    setAudit(auditData);
  };

  useEffect(() => {
    // fetch latest ANNOTATE audit from store on page load:
    fetchAudit().catch((err) => {
      console.log(err);
    });
  }, [props.storeInstance.ready]);

  return audit !== null ? (
    <UserInterface audit={audit} showAppBar={false} />
  ) : (
    <></>
  );
};
