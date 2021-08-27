import { useState, useEffect, useContext, createContext } from "react";
import {
  TrustedService,
  UiTemplate,
} from "@/services/trustedServices/interfaces";
import {
  getTrustedService,
  getUiTemplate,
  TrustedServiceClass,
} from "@/services/trustedServices";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  children: React.ReactElement;
}

interface Context {
  uiElements: TrustedServiceClass[];
  ready: boolean;
}

const trustedServiceContext = createContext<Context>(null);

// Hook for child components to get the trustedService object ...
// ... and re-render when it changes.
export const useTrustedService = (): Context =>
  useContext(trustedServiceContext);

// Provider hook that creates auth object and handles state
function useProviderTrustedService() {
  const auth = useAuth(); // TODO: get this out of here!

  const [trustedServices, setTrustedServices] =
    useState<TrustedService[] | null>(null);
  const [uiElements, setUiElements] =
    useState<TrustedServiceClass[] | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // Retrive the list of trusted services for the user's team
    if (!auth.ready || trustedServices || !auth.userProfile) return;
    void getTrustedService(auth.userProfile.team.id).then(setTrustedServices);
  }, [auth]);

  const unpackUiElements = (
    apiUrl: string,
    template: UiTemplate
  ): TrustedServiceClass[] => {
    const elements: TrustedServiceClass[] = [];
    template.uiElements.forEach(({ placement, uiParams, apiEndpoint }) => {
      const { value, icon, tooltip } = uiParams;

      elements.push(
        new TrustedServiceClass(
          template.trustedService,
          placement,
          `${apiUrl}${apiEndpoint}`,
          value,
          icon,
          tooltip
        )
      );
    });
    return elements;
  };

  useEffect(() => {
    if (!trustedServices) return;

    // When the list of trusted services has been fetched,
    // fetch the temaplates for all UI elements and store them in objects
    const elements: TrustedServiceClass[] = [];
    trustedServices.forEach(({ base_url }) => {
      if (!base_url || base_url === "") return;
      void getUiTemplate(base_url).then((template) => {
        // TODO: validate the templates against a schema!
        elements.push(...unpackUiElements(base_url, template));
      });
    });
    setUiElements(elements);
  }, [trustedServices]);

  useEffect(() => {
    if (!uiElements) return;
    setReady(true);
  }, [uiElements]);

  return {
    uiElements,
    ready,
  };
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useTrustedServices().
export function ProvideTrustedService(props: Props): React.ReactElement {
  const trustedService = useProviderTrustedService();
  return (
    <trustedServiceContext.Provider value={trustedService}>
      {props.children}
    </trustedServiceContext.Provider>
  );
}
