import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

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
          text: "👋 Hello there! I'm here to chat with you.\n\n💬 Just send me a message and I’ll try my best to respond.\n✨ Let’s get started!",
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

      const apiUrl = `https://flex-chat-api.vercel.app/?q=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === "success") {
        const message = data.response;

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
  }

  res.sendStatus(200);
});

app.listen(3000);
