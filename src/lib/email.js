export const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxmIxyUrvk5-MGncp6JNza8PQ_RkD1-jJ-w_VESG3rnsUzfeIsDO8QNPfClSFf78nf1uw/exec";

export const sendEmail = async (
  to,
  subject,
  body,
  scriptUrl = DEFAULT_APPS_SCRIPT_URL,
) => {
  const url =
    scriptUrl && scriptUrl.trim() !== "" ? scriptUrl : DEFAULT_APPS_SCRIPT_URL;
  const recipients = Array.isArray(to) ? to.join(",") : to;
  const payload = {
    to: recipients,
    recipient: recipients,
    email: recipients,
    subject: subject,
    body: body,
    htmlBody: body,
  };
  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.error("Email dispatch failed:", err);
    return false;
  }
};
