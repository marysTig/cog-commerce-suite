import { supabase } from "@/integrations/supabase/client";

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

/**
 * Sends a Markdown formatted message to the configured Telegram Chat.
 * @param message The message to send. Supports Markdown formatting (**, _, ||, etc.)
 */
export const sendTelegramMessage = async (message: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not configured, skipping notification.");
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Telegram API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram error sending fetch request:", error);
    return false;
  }
};
