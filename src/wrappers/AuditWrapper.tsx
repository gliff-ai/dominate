import { ReactElement, useEffect, useState, useRef } from "react";
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

export const AuditWrapper = (props: Props): ReactElement | null => {
  const { collectionUid = "" } = useParams<string>(); // uid of selected gallery, from URL
  const auth = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AnnotationSession[] | null>(null);
  const isMounted = useRef(false);
  const [collectionTitle, setCollectionTitle] = useState<string>("");
  const [imageData, setImageData] = useState<ImageData>({
    imageName: "",
    imageUid: "",
  });

  const fetchCollectionTitle = useStore(
    props,
    (storeInstance) => {
      if (!auth?.user?.username) return;
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
    [collectionUid]
  );

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
    if (!collectionUid) return;
    fetchCollectionTitle();
  }, [collectionUid, fetchCollectionTitle, isMounted, auth]);

  useEffect(() => {
    props.setProductNavbarData({
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
    });
  }, [collectionTitle, imageData]);

  if (!auth) return null;
  if (!collectionUid) return null;

  return sessions !== null ? (
    <UserInterface
      sessions={sessions}
      setProductsNavbarImageData={setImageData}
      showAppBar={false}
    />
  ) : (
    <></>
  );
};
