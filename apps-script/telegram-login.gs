// Made with Claude (Anthropic) · © Homes in Georgia · Created by Irakli Kvirkvelia
//
// Telegram login for ღიმილი CRM — server side (Google Apps Script).
//
// Setup (Apps Script → Project Settings → Script properties):
//   TELEGRAM_BOT_TOKEN     token from @BotFather (never put it in the website code)
//   TELEGRAM_ALLOWED       optional: comma-separated Telegram usernames or numeric IDs
//                          allowed to sign in. Default: @centre_gimili, @kvirkvel1a
// In @BotFather: /setdomain → mrkvirkvelia.github.io
//
// Wiring: in doPost(e), next to the existing 'login' action, add
//   if (body.action === 'telegramLogin') return json_(telegramLogin_(body.telegram));
// and replace createSessionForTelegram_ below with the same session creation the
// password login already uses, so the returned token works for every other action.

function telegramLogin_(telegram) {
  var props = PropertiesService.getScriptProperties();
  var botToken = props.getProperty('TELEGRAM_BOT_TOKEN');
  if (!botToken) return { ok: false, status: 500, error: 'Telegram-ით შესვლა ჯერ არ არის დაყენებული' };
  if (!telegram || !telegram.id || !telegram.hash) return { ok: false, status: 400, error: 'Telegram-ის მონაცემები არასრულია' };
  if (!verifyTelegramAuth_(telegram, botToken)) return { ok: false, status: 401, error: 'Telegram-ის ხელმოწერა არასწორია' };

  var allowed = parseAllowedTelegram_(props.getProperty('TELEGRAM_ALLOWED') || DEFAULT_TELEGRAM_ALLOWED);
  var id = String(telegram.id);
  var username = String(telegram.username || '').toLowerCase();
  if (!allowed[id] && !(username && allowed['@' + username])) return { ok: false, status: 403, error: 'ამ Telegram ანგარიშს CRM-ზე წვდომა არ აქვს' };

  var name = [telegram.first_name, telegram.last_name].filter(String).join(' ') || telegram.username || 'Telegram';
  var user = { name: name, email: '', telegramId: id, telegramUsername: username ? '@' + username : '', provider: 'telegram' };
  return { ok: true, token: createSessionForTelegram_(user), user: user };
}

// Official check: https://core.telegram.org/widgets/login#checking-authorization
function verifyTelegramAuth_(data, botToken) {
  var checkString = Object.keys(data)
    .filter(function (key) { return key !== 'hash' && data[key] !== undefined && data[key] !== null; })
    .sort()
    .map(function (key) { return key + '=' + data[key]; })
    .join('\n');
  var secret = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, botToken, Utilities.Charset.UTF_8);
  var signature = Utilities.computeHmacSha256Signature(Utilities.newBlob(checkString).getBytes(), secret);
  var hex = signature.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
  var fresh = Math.floor(Date.now() / 1000) - Number(data.auth_date) < 86400;
  return fresh && hex === String(data.hash).toLowerCase();
}

var DEFAULT_TELEGRAM_ALLOWED = '@centre_gimili, @kvirkvel1a';

function parseAllowedTelegram_(raw) {
  var out = {};
  String(raw || '').split(',').forEach(function (part) {
    var key = part.trim().toLowerCase();
    if (!key) return;
    if (!/^\d+$/.test(key) && key.charAt(0) !== '@') key = '@' + key;
    out[key] = true;
  });
  return out;
}

// Placeholder — replace with the existing session logic of the password login.
function createSessionForTelegram_(user) {
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('session:' + token, JSON.stringify(user), 21600);
  return token;
}
