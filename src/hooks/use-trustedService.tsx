import { useState, useEffect, useContext, createContext } from "react";
import Ajv from "ajv";
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
import { UiTemplateSchema } from "@/services/trustedServices/schemas";

interface Props {
  children: React.ReactElement;
}

interface Context {
  uiElements: TrustedServiceClass[] | null;
  ready: boolean;
}

const trustedServiceContext = createContext<Context | null>(null);

// Hook for child components to get the trustedService object ...
// ... and re-render when it changes.
export const useTrustedService = (): Context | null =>
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
    if (auth === null || !auth.userProfile || trustedServices) return;
    void getTrustedService().then(setTrustedServices);
  }, [auth, trustedServices]);

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
          apiUrl,
          apiEndpoint,
          icon,
          tooltip,
          value
        )
      );
    });
    return elements;
  };

  useEffect(() => {
    if (!trustedServices || uiElements) return;

    const ajv = new Ajv();

    const validate = ajv.compile(UiTemplateSchema);

    // When the list of trusted services has been fetched,
    // fetch the temaplates for all UI elements and store them in objects
    const elements: TrustedServiceClass[] = [];
    trustedServices.forEach(({ url, name }) => {
      if (!url || url === "") return;
      void getUiTemplate(url)
        .then((template) => {
          if (template && validate(template)) {
            setUiElements((prevElements) => {
              const newElements = unpackUiElements(url, template);
              if (!prevElements) {
                return newElements;
              }
              prevElements.push(...newElements);
              return prevElements;
            });
          } else {
            console.error(`UI template for ${name} doesn't match the schema.`);
          }
        })
        .catch(() =>
          console.error(
            `Cannot fetch UI Elements for the trusted service ${name}.`
          )
        );
    });
    setUiElements(elements);
  }, [trustedServices, uiElements]);

  useEffect(() => {
    if (!uiElements) return;
    setReady(true);
  }, [uiElements]);

  if (!auth) return null;

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
