export function isBot(userAgent) {
  if (!userAgent) return false;
  const lowerAgent = userAgent.toLowerCase();
  const botKeywords = [
    "googlebot",
    "bingbot",
    "yandexbot",
    "baiduspider",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "embedly",
    "quora link preview",
    "showyoubot",
    "outbrain",
    "pinterest/0.",
    "developers.google.com/+/web/snippet",
    "slackbot",
    "vkshare",
    "w3c_validator",
    "redditbot",
    "applebot",
    "whatsapp",
    "flipboard",
    "tumblr",
    "bitlybot",
    "skypeuripreview",
    "nuzzel",
    "discordbot",
    "google-coop",
    "adsbot-google",
    "mediapartners-google",
    "google-read-aloud",
    "duplexweb-google"
  ];
  return botKeywords.some((keyword) => lowerAgent.includes(keyword));
}
