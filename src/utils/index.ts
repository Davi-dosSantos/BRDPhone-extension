import { SipConstants } from "./../lib";
import { deleteWindowIdKey, getWindowIdKey, saveWindowIdKey } from "./storage";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

export const formatPhoneNumber = (number: string) => {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance();

    const phoneNumber = phoneUtil.parse(number, "US");
    return phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);
  } catch (error) {}
  return number;
};

export const openPhonePopup = () => {
  return new Promise((resolve) => {
    const runningPhoneWindowId = getWindowIdKey();
    if (runningPhoneWindowId) {
      chrome.windows.update(runningPhoneWindowId, { focused: true }, () => {
        if (chrome.runtime.lastError) {
          deleteWindowIdKey();
          initiateNewPhonePopup(resolve);
        }
        resolve(1);
      });
    } else {
      initiateNewPhonePopup(resolve);
    }
  });
};

const initiateNewPhonePopup = (callback: (v: unknown) => void) => {
  const cfg: chrome.windows.CreateData = {
    url: chrome.runtime.getURL("window/index.html"),
    width: 440,
    height: 720,
    focused: true,
    type: "panel",
    state: "normal",
  };
  chrome.windows.create(cfg, (w) => {
    callback(1);
    if (w && w.id) saveWindowIdKey(w.id);
  });
};

export const isSipClientRinging = (callStatus: string) => {
  return callStatus === SipConstants.SESSION_RINGING;
};

export const isSipClientAnswered = (callStatus: string) => {
  return callStatus === SipConstants.SESSION_ANSWERED;
};

export const isSipClientIdle = (callStatus: string) => {
  return (
    callStatus === SipConstants.SESSION_ENDED ||
    callStatus === SipConstants.SESSION_FAILED
  );
};

export const normalizeUrl = (input: string): string => {
  // Extract the domain name
  const url = new URL(input.startsWith("http") ? input : `https://${input}`);

  // Return the fully formed URL
  return `${url.protocol}//${url.hostname}/api/v1`;
};

// --- daemon window helpers ---

const DAEMON_WINDOW_KEY = "daemonWindowId";

export const getDaemonWindowIdKey = async (): Promise<number | null> => {
  return new Promise((res) => {
    chrome.storage.local.get([DAEMON_WINDOW_KEY], (items) => {
      res(items[DAEMON_WINDOW_KEY] ?? null);
    });
  });
};

export const saveDaemonWindowIdKey = (id: number) => {
  chrome.storage.local.set({ [DAEMON_WINDOW_KEY]: id });
};

export const deleteDaemonWindowIdKey = () => {
  chrome.storage.local.remove([DAEMON_WINDOW_KEY]);
};

/**
 * Open (or focus) a persistent daemon window that will keep the SIP client alive.
 * The daemon window loads the same app page but with ?daemon=1 query param.
 */
export const openDaemonWindow = () => {
  return new Promise((resolve) => {
    getDaemonWindowIdKey().then((runningId) => {
      if (runningId) {
        chrome.windows.update(runningId, { focused: true }, (w) => {
          if (chrome.runtime.lastError) {
            deleteDaemonWindowIdKey();
            createDaemon();
          } else {
            resolve(runningId);
          }
        });
      } else {
        createDaemon();
      }
    });

    function createDaemon() {
      const cfg: chrome.windows.CreateData = {
        url: chrome.runtime.getURL("window/index.html?daemon=1"),
        width: 420,
        height: 640,
        focused: true,
        type: "popup",
        state: "normal",
      };
      chrome.windows.create(cfg, (w) => {
        if (w && w.id) saveDaemonWindowIdKey(w.id);
        resolve(w?.id ?? null);
      });
    }
  });
};
