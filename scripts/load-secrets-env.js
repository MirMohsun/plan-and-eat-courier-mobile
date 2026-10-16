const fs = require('node:fs');
const path = require('node:path');

const dotenv = require('dotenv');

const secretsEnvPath = path.resolve(__dirname, '../secrets/.env');

if (fs.existsSync(secretsEnvPath)) {
  // Do not override vars already set (e.g. EXPO_PUBLIC_APP_ENV from cross-env).
  dotenv.config({ path: secretsEnvPath });
}
