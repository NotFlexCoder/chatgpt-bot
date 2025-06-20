import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const TOKEN = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL;
const API_RESPONSE = process.env.API_RESPONSE;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const update = req.body;

  if (update.message) {
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
    } else {
      await fetch(`${TELEGRAM_API}/sendChatAction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          action: "typing"
        })
      });

      const response = await fetch(`${API_URL}?q=${encodeURIComponent(text)}`);
      const data = await response.json();

      if (!data || data.status !== "success") {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "❌ Error: Unable to fetch response.",
            reply_to_message_id: messageId
          }),
        });
        return res.sendStatus(200);
      }

      const message = data.response || process.env.API_RESPONSE;

      if (!message) {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "⚠️ Missing API response in environment.",
            reply_to_message_id: messageId
          }),
        });
        return res.sendStatus(200);
      }

      if (message.length <= 4096) {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            reply_to_message_id: messageId
          }),
        });
      } else {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "⚠️ Sorry, the response is too long to send.",
            reply_to_message_id: messageId
          }),
        });
      }
    }
  }

  res.sendStatus(200);
});

app.listen(3000);
