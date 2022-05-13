/* If we are calling a function from useEffect, this ensures it is wrapped and updates on DominateStore becoming ready.
eg.

const fetchImageItems = useCallback(() => {
    props.storeInstance
      .getImagesMeta(collectionUid)
 }, [props.storeInstance, props.storeInstance.ready, collectionUid]);
 
 becomes:

const fetchImageItems = useStore(props, (storeInstance) => {
    storeInstance
      .getImagesMeta(collectionUid)
}, [collectionUid]);

which makes the dependencies tider and means we won't call the storeInstance method unitl it's ready.
*/
import { useCallback } from "react";
import { DominateStore } from "@/store";

const useStore = (
  storeInstance: DominateStore,
  fn: () => void,
  deps: unknown[] = []
): (() => void) =>
  useCallback(() => {
    if (storeInstance.ready) {
      fn.call(this, storeInstance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeInstance, storeInstance.ready, ...deps]);

export { useStore };
