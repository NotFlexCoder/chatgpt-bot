import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const TOKEN = process.env.BOT_TOKEN;
  const API_URL = process.env.API_URL;
  const API_RESPONSE = process.env.API_RESPONSE;
  const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

  if (!TOKEN || !API_URL) {
    return res.status(200).json({ status: "error", message: "Missing environment variables" });
  }

  const update = req.body;
  if (!update.message) return res.status(200).end();

  const chatId = update.message.chat.id;
  const text = update.message.text;
  const messageId = update.message.message_id;

  if (text === "/start") {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "👋 Hello there! I'm here to chat with you.\n\n💬 Just send me a message and I’ll try my best to respond.",
        reply_to_message_id: messageId
      }),
    });
    return res.status(200).end();
  }

  await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" })
  });

  const response = await fetch(`${API_URL}?q=${encodeURIComponent(text)}`);
  const data = await response.json();

  const message = data.message || API_RESPONSE || "⚠️ No message in API response";

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      reply_to_message_id: messageId
    }),
  });

  res.status(200).end();
}
