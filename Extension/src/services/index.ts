import {
  getBrowserInfo,
  getCurrentTabId,
  injectScript,
} from "./chromeExtensionsService";
import { postChat } from "./modelsService";

export const useModelsService = () => {
  return { postChat };
};

export const useChromeExtensionService = () => {
  return { getBrowserInfo, getCurrentTabId, injectScript };
};
