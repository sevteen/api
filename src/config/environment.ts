// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

import { get } from "env-var";

// console.log(process.env);
const environmentConfig = {
  APPLICATION_NAME: get("APP_NAME").default("the-api").asString(),
  HOST: get("HOST").default("0.0.0.0").asString(),
  PORT: get("PORT").default(3000).asPortNumber(),
  DB_HOST: get("DB_HOST").required().asString(),
  DB_PORT: get("DB_PORT").required().asPortNumber(),
  DB_USER: get("DB_USER").required().asString(),
  DB_PASSWORD: get("DB_PASSWORD").required().asString(),
  DB_NAME: get("DB_NAME").required().asString(),
  DB_MIN_CONNECTIONS: get("DB_MIN_CONNECTIONS").default(5).asIntPositive(),
  DB_MAX_CONNECTIONS: get("DB_MAX_CONNECTIONS").default(30).asIntPositive(),
};

export { environmentConfig };
