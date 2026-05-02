const TELEGRAM_CHANNEL = 'OttoETHDeployments';
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

let lastSeenId = null;

async function scrapeTelegram() {
  try {
    const res = await fetch(`https://t.me/s/${TELEGRAM_CHANNEL}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();

    const matches = [...html.matchAll(/data-post="[^"]+\/(\d+)"/g)];
    if (!matches.length) return;

    const latestId = parseInt(matches[matches.length - 1][1]);
    if (lastSeenId === null) { lastSeenId = latestId; return; }
    if (latestId <= lastSeenId) return;

    for (const match of matches) {
      const postId = parseInt(match[1]);
      if (postId <= lastSeenId) continue;

      const postUrl = `https://t.me/${TELEGRAM_CHANNEL}/${postId}`;
      await sendWebhook(`📡 **New Otto ETH Deployment**\n${postUrl}`);
      console.log(`📨 Forwarded post ${postId}`);
    }

    lastSeenId = latestId;
  } catch (err) {
    console.error('Telegram scrape error:', err);
  }
}

async function sendWebhook(content) {
  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
}

setInterval(scrapeTelegram, 30000);
scrapeTelegram();
console.log('✅ Telegram forwarder running...');
