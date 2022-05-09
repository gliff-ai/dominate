import { ReactElement, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import UserInterface, { AnnotationSession } from "@gliff-ai/audit";
import { IconButton, icons } from "@gliff-ai/style";
import { DominateStore } from "@/store";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { setStateIfMounted } from "@/helpers";
import { ProductNavbarData } from "@/components";

const logger = console;

interface ImageData {
  imageName: string;
  imageUid: string;
}
interface Props {
  storeInstance: DominateStore;
  setProductNavbarData: (data: ProductNavbarData) => void;
}

export const AuditWrapper = ({
  storeInstance,
  setProductNavbarData,
}: Props): ReactElement | null => {
  const { collectionUid = "" } = useParams<string>(); // uid of selected gallery, from URL
  const auth = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AnnotationSession[] | null>(null);
  const [collectionTitle, setCollectionTitle] = useState<string>("");
  const [imageData, setImageData] = useState<ImageData>({
    imageName: "",
    imageUid: "",
  });

  const isMounted = useRef(false);

  const fetchCollectionTitle = useStore(
    storeInstance,
    () => {
      if (!auth?.user?.username || !collectionUid) return;
      storeInstance
        .getImagesMeta(collectionUid)
        .then((items) => {
          const { galleryMeta } = items;
          setStateIfMounted(
            galleryMeta?.name,
            setCollectionTitle,
            isMounted.current
          );
        })
        .catch((err) => {
          logger.log(err);
        });
    },
    [auth?.user?.username, collectionUid]
  );

  useEffect(() => {
    // fetch audit data (should run once at mount)
    const fetchAudit = async () => {
      const sessionsData = await storeInstance.getAudits(collectionUid);
      setSessions(sessionsData);
    };

    // fetch latest ANNOTATE audit from store on page load:
    fetchAudit().catch((e) => {
      console.error(e);
    });
  }, [collectionUid, storeInstance]);

  useEffect(() => {
    const tier = auth?.userProfile?.team.tier;
    if (tier && tier.id < 2) {
      // no AUDIT on free tier
      navigate("/manage");
    }
  }, [auth?.userProfile?.team.tier, navigate]);

  useEffect(() => {
    if (!collectionUid) return;
    fetchCollectionTitle();
  }, [collectionUid, fetchCollectionTitle, isMounted, auth]);

  useEffect(() => {
    setProductNavbarData({
      teamName: auth?.userProfile?.team.name || "",
      projectName: collectionTitle || "",
      imageName: imageData?.imageName || "",
      buttonBack: (
        <IconButton
          onClick={() => navigate("/manage")}
          tooltip={{
            name: `Return to MANAGE `,
          }}
          tooltipPlacement="bottom"
          icon={icons.navigationMANAGE}
        />
      ),
      buttonForward:
        imageData?.imageUid === "" ? (
          <IconButton
            onClick={() => {
              setImageData({
                imageName: "",
                imageUid: "",
              });
              navigate(`/curate/${collectionUid}`);
            }}
            tooltip={{
              name: `Open ${collectionTitle} in CURATE`,
            }}
            tooltipPlacement="bottom"
            icon={icons.navigationCURATE}
          />
        ) : (
          <IconButton
            onClick={() =>
              navigate(
                `/annotate/${collectionUid}/${imageData?.imageUid || ""}`
              )
            }
            tooltip={{
              name: `Open ${imageData?.imageName || ""} in ANNOTATE`,
            }}
            tooltipPlacement="bottom"
            icon={icons.navigationANNOTATE}
          />
        ),
      productLocation: "AUDIT",
      productLocationIcon: "audit",
    });
  }, [collectionTitle, imageData]);

  if (!auth || !collectionUid || sessions === null) return null;

  return (
    <UserInterface
      sessions={sessions}
      setProductsNavbarImageData={setImageData}
      showAppBar={false}
    />
  );
};
