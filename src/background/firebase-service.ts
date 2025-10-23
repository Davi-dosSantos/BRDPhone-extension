import { initializeApp } from "firebase/app";
// Importamos getMessaging, getToken e isSupported, pois serão usados no Frontend
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// NOTE: Substitua este stub pela sua importação real de jssip/lib/Utils se necessário.
const isEmpty = (value: any) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" || Array.isArray(value))
    return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAlm35BY9Fe_ZXpfoR-WAHnNNKEO-UzUwQ",
  authDomain: "linphone-79371.firebaseapp.com",
  projectId: "linphone-79371",
  storageBucket: "linphone-79371.firebasestorage.app",
  messagingSenderId: "1022372695421",
  appId: "1:1022372695421:web:fc2d0d7d647f97b0771014",
  measurementId: "G-WTS2J2XSHX",
};

const API_URL = "http://168.121.7.18:3000";
const VAPID_KEY =
  "BLmMJYG3fv9CQ4TiRtTEKz2X1JSXzJ_kzv7kCvTt1UVPBecj5_BNy6_9vl_Y1BFXxV4fs1y0KrJKGhFEPqyxcew";

interface UpsertApi {
  userID_Domain: string;
  token: string;
  plataform: string;
}

function getStorageData(keys: string[]): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, resolve);
  });
}

/**
 * Envia o token para sua API de backend e salva no storage.
 * Esta função é executada no Service Worker.
 */
async function apiPushToken(token: string): Promise<void> {
  const storageData = await getStorageData(["USER_ID_DOMAIN"]);

  const userId = storageData.USER_ID_DOMAIN;
  const pushToken = token;

  if (!userId || !pushToken) {
    console.warn(
      "USER_ID_DOMAIN ou PushToken ausentes. Não é possível fazer o UPSERT da API."
    );
    return;
  }

  const data: UpsertApi = {
    userID_Domain: userId,
    token: pushToken,
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
          console.log("Sucesso ao enviar dados para a API:", response);
          resolve();
        } catch (error) {
          reject(new Error("Falha ao analisar JSON de resposta."));
        }
      } else {
        reject(
          new Error(
            `Solicitação falhou com status ${xhr.status}: ${xhr.statusText}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Erro de rede ou solicitação falhou."));
    };

    xhr.send(JSON.stringify(data));
  });
}

/**
 * Inicializa o Firebase App no Service Worker.
 * NOTA: Não contém getToken para evitar erros de contexto.
 */
export function initializeFirebase(): void {
  initializeApp(firebaseConfig);
  console.log("Firebase App inicializado no Service Worker.");
}

/**
 * [USADO NO SW] Recebe o token gerado pelo Frontend, salva e envia para a API.
 */
export async function handleTokenFromFrontend(token: string): Promise<void> {
  if (token) {
    chrome.storage.sync.set({ PushToken: token });
    console.log("FCM Token recebido e salvo via Frontend.");
    await apiPushToken(token);
  }
}

/**
 * Gera o token FCM no Frontend (Janela) e o retorna.
 */
export async function generateTokenInFrontend(): Promise<string> {
  const isMessagingSupported = await isSupported();

  if (!isMessagingSupported) {
    console.warn(
      "Firebase Messaging não suportado na Janela. Verificar permissões."
    );
    return "";
  }

  // Inicializa o App no Frontend. Note que o App precisa ser inicializado em AMBOS os contextos.
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    return currentToken;
  } catch (err) {
    // Captura a falha na obtenção do token (e.g., usuário negou permissão)
    console.error("Ocorreu um erro ao obter o token no Frontend. ", err);
    return "";
  }
}
