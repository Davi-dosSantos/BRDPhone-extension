import {
  initializeFirebase,
  handleTokenFromFrontend,
} from "./firebase-service";

// --- EXECUÇÃO E REGISTRO DE LISTENERS (TOPO) ---

console.log(
  "Service Worker: Script principal INICIADO. Registrando listeners..."
);

// 1. Inicializa o Firebase App (Somente o App, sem getToken)
console.log("Service Worker: Initializing Firebase...");
initializeFirebase();

// 2. Listener do Ícone da Extensão: Tenta focar a janela existente ou cria uma nova.
chrome.action.onClicked.addListener(async (tab) => {
  const windowId = await getWindowKey();

  if (windowId) {
    chrome.windows.update(windowId, { focused: true }, (window) => {
      if (chrome.runtime.lastError) {
        console.warn(
          "Janela não encontrada, recriando. Erro:",
          chrome.runtime.lastError.message
        );
        removeWindowKey();
        initiateNewPhonePopup();
      } else if (!window) {
        initiateNewPhonePopup();
      }
    });
  } else {
    initiateNewPhonePopup();
  }
});

// 3. Listener de Mensagens (Badge Update E Token FCM)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 3a. Lógica de atualização do Badge (Conectado/Desconectado)
  if (request.type === "UPDATE_CONNECTION_STATUS") {
    const isRegistered = request.payload.isRegistered;
    const color = isRegistered ? "#008000" : "#FF0000";
    chrome.action.setBadgeText({ text: " " });
    chrome.action.setBadgeBackgroundColor({ color: color });
    sendResponse({ status: "Badge updated" });
    return true;
  }

  // 3b. NOVA LÓGICA: Receber Token do Frontend
  if (request.type === "FCM_TOKEN_GENERATED") {
    handleTokenFromFrontend(request.payload.token)
      .then(() => sendResponse({ status: "Token processado com sucesso" }))
      .catch((err) => {
        console.error("Erro ao processar token no Service Worker", err);
        sendResponse({ status: "Erro ao processar token" });
      });
    return true; // Essencial para chamadas assíncronas
  }
});

// 4. Listener GCM/FCM (Recebe a notificação Push do servidor externo)
chrome.gcm.onMessage.addListener(function (message) {
  console.log("Mensagem FCM recebida via chrome.gcm:", message.data);
  chrome.notifications.create("notificationId", {
    type: "basic",
    iconUrl: "icon.png",
    title: "Nova Mensagem",
    message: "Dados push recebidos",
  });
});

console.log("Service Worker: Ready to receive messages.");

// --- DECLARAÇÕES DE FUNÇÕES DE SUPORTE ---

const initiateNewPhonePopup = () => {
  chrome.windows.create(
    {
      url: chrome.runtime.getURL("window/index.html"),
      width: 440,
      height: 750,
      focused: true,
      type: "popup",
    },
    function (window) {
      if (window?.id) {
        saveWindowKey(window?.id);
      }
    }
  );
};

const saveWindowKey = async (id: number) => {
  await chrome.storage.local.set({
    WindowKey: id,
  });
};

const removeWindowKey = async () => {
  await chrome.storage.local.remove("WindowKey");
};

const getWindowKey = async (): Promise<number> => {
  const result = await chrome.storage.local.get(["WindowKey"]);
  return result.WindowKey as number;
};

export {};
