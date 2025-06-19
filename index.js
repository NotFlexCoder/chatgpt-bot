const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());

const TOKEN = "YOUR_BOT_TOKEN_HERE";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

app.post("/", async (req, res) => {
  const update = req.body;

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;

    if (text === "/start") {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Welcome! Please send me a message.",
        }),
      });
    } else {
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
            }),
          });
        } else {
          await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "⚠️ Sorry, the response is too long to send.",
            }),
          });
        }
      }
    }
  }

  res.sendStatus(200);
});

app.listen(3000);