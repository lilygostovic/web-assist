// TODO:: fix or remove this function

// import { TransitionQualifier, TransitionType } from "../../../types";

// interface NavigationInfo {
//   transitionQualifiers: TransitionQualifier[];
//   transitionType: TransitionType;
// }

// export const getNavigationInfo = (tabId: number): Promise<NavigationInfo> => {
//   return new Promise((resolve) => {
//     chrome.webNavigation.onCompleted.addListener(
//       (details) => {
//         const navigationInfo: NavigationInfo = {
//           transitionQualifiers: details.transitionQualifiers,
//           transitionType: details.transitionType,
//         };
//         resolve(navigationInfo);
//       },
//       { tabId: tabId }
//     );
//   });
// };

export const getNavigationInfo = () => {};
