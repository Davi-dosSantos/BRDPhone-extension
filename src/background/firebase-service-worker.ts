// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";
import { isEmpty } from "jssip/lib/Utils";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlm35BY9Fe_ZXpfoR-WAHnNNKEO-UzUwQ",
  authDomain: "linphone-79371.firebaseapp.com",
  projectId: "linphone-79371",
  storageBucket: "linphone-79371.firebasestorage.app",
  messagingSenderId: "1022372695421",
  appId: "1:1022372695421:web:fc2d0d7d647f97b0771014",
  measurementId: "G-WTS2J2XSHX",
};

var API_URL = "http://168.121.7.18:3000";
var push_token = "";
var user_id_domain = "";

interface UpsertApi {
  userID_Domain: string;
  token: string;
  plataform: string;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

getToken(getMessaging(app), {
  vapidKey:
    "BLmMJYG3fv9CQ4TiRtTEKz2X1JSXzJ_kzv7kCvTt1UVPBecj5_BNy6_9vl_Y1BFXxV4fs1y0KrJKGhFEPqyxcew",
})
  .then((currentToken) => {
    if (currentToken) {
      console.log(currentToken);
      push_token = currentToken;
      if (!isEmpty(chrome.storage.sync.get(["PushToken"]))) {
        chrome.storage.sync.set({ PushToken: push_token });
      }
    } else {
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  })
  .catch((err) => {
    console.log("An error occurred while retrieving token. ", err);
  });

function getStorageData(keys: string[]): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, resolve);
  });
}

async function apiPushToken(): Promise<any> {
  const storageData = await getStorageData(["USER_ID_DOMAIN", "PushToken"]);

  const userId = storageData.USER_ID_DOMAIN;
  const token = storageData.PushToken;

  if (!userId || !token) {
    throw new Error(
      "Missing USER_ID_DOMAIN or PushToken in storage. Cannot perform UPSERT."
    );
  }

  const data: UpsertApi = {
    userID_Domain: userId,
    token: token,
    plataform: "Extension",
  };

  const url = API_URL + "/user/upsert";

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to parse JSON response."));
        }
      } else {
        reject(
          new Error(
            `Request failed with status ${xhr.status}: ${xhr.statusText}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error or request failed."));
    };

    xhr.send(JSON.stringify(data));
  });
}

apiPushToken()
  .then((response) => {
    console.log("Successfully post data:", response);
  })
  .catch((error) => {
    console.error("Error during POST request:", error);
  });
