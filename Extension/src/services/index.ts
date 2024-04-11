import { getBrowserInfo, injectScript } from "./chromeExtensionsService";
import { continueExecution, postChat } from "./modelsService";

export const useModelsService = () => {
  return { continueExecution, postChat };
};

export const useChromeExtensionService = () => {
  return { getBrowserInfo, injectScript };
};
