import { getBrowserInfo } from "./chromeExtensionsService";
import { continueExecution, performAction, postChat } from "./modelsService";

export const useModelsService = () => {
  return { performAction, continueExecution, postChat };
};

export const useChromeExtensionService = () => {
  return { getBrowserInfo };
};
