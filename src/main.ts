import { env } from "bun"
import { buildApp } from "./app"
import { type EnvConfig, parseEnvConfig } from "./config"

export default buildApp(parseEnvConfig(env as EnvConfig))
