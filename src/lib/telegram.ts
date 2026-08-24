export function buildTelegramUrl(telegramLink: string, message: string): string | null {
  const match = telegramLink.match(/t\.me\/([^/?#]+)/i);
  if (!match?.[1]) return null;
  return `https://t.me/${match[1]}?text=${encodeURIComponent(message)}`;
}
