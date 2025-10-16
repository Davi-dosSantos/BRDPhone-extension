export function redirectCall(targetNumber: string): void {
  chrome.runtime.sendMessage(
    {
      type: "REDIRECT_CALL",
      payload: { targetNumber },
    },
    (response) => {
      if (response?.success) {
        console.log(`Call redirected to ${targetNumber}`);
      } else {
        console.error("Failed to redirect call", response?.error);
      }
    }
  );
}
