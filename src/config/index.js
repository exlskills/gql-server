import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load whatever's in the .env file
dotenv.config();

const cfg = {
  http_port: process.env.PORT || 8080,
  cors_origin: process.env.CORS_REGEX
    ? [new RegExp(process.env.CORS_REGEX)]
    : [/localhost/, /exlskills.com/, /\.exlskills\.com$/],
  mongo: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017',
    db: process.env.DB_NAME || 'webph2_dev',
    reconnectTimeout: process.env.DB_RECONNECT_TIMEOUT || 5000
  },
  public_key_file:
    process.env.JWT_PUB_KEY_FILE ||
    path.join(__dirname, '../config/sample_keys/public_key.pem'),
  public_key_b64: process.env.JWT_PUB_KEY_B64,
  card_ema: {
    n: 10
  },
  wsenv_signalling_url:
    process.env.WSENV_SIGNALLING_URL ||
    'https://wsenv-signalling-api.exlcode.com/v0/connect-grading',
  logging_level:
    process.env.LOGGING_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  db_debug_log:
    process.env.DB_DEBUG_LOG || process.env.NODE_ENV !== 'production',
  github_user: process.env.GITHUB_USER || 'dummy_github_user',
  github_token: process.env.GITHUB_TOKEN || 'create_me'
};

export default cfg;

export const jwtpublic_key = (() => {
  if (cfg.public_key_b64) {
    return new Buffer(cfg.public_key_b64, 'base64').toString('ascii');
  }
  return fs.readFileSync(cfg.public_key_file);
})();
