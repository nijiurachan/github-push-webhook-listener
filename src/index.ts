import { createWebMiddleware, Webhooks } from "@octokit/webhooks"
import { env, type Serve } from "bun"
import { PushHandler } from "./push_handler"

/**
 * Configuration required for the app parsed from environment variables
 */
type AppConfig = {
    /** URL path to listen to webhook */
    urlPath: string
    /** GitHub webhook secret */
    secret: string
    /** Map of refs to update scripts */
    scripts: Map<string, string>
}

/**
 * Configuration items from environment variables
 */
type EnvConfig = {
    /** URL path to listen to webhook */
    URL_PATH?: string | undefined
    /** GitHub webhook secret */
    WEBHOOK_SECRET?: string | undefined
    /** JSON object (`Record<string, string>`) of refs to update scripts */
    HOOK_SCRIPTS?: string | undefined
}

/**
 * Parses environment variables into a configuration object
 */
export function parseEnvConfig({
    URL_PATH: urlPath,
    WEBHOOK_SECRET: secret,
    HOOK_SCRIPTS: hooks,
}: EnvConfig): AppConfig {
    if (!urlPath || !secret || !hooks) {
        throw Error(
            "usage: URL_PATH=/webhooks WEBHOOK_SECRET=... HOOK_SCRIPTS='{...}' bun run index.ts",
        )
    }

    try {
        const scripts = new Map(Object.entries(JSON.parse(hooks))) as Map<
            string,
            string
        >

        return { urlPath, secret, scripts }
    } catch (e) {
        throw Error(
            `Specify HOOK_SCRIPTS as a JSON object (e.g. HOOK_SCRIPTS='{"main": "/var/www/myapp-prod/update_deploy.sh", "dev": "/var/www/myapp-devel/update_deploy.sh"}')`,
            { cause: e },
        )
    }
}

/** Builds the app */
export function buildApp({
    secret,
    urlPath,
    scripts,
}: AppConfig): Serve.Options<void> {
    const hooks = new Webhooks({ secret })
    const webhookMiddleware = createWebMiddleware(hooks, { path: urlPath })
    const handler = new PushHandler(scripts)

    handler.listenTo(hooks)

    return {
        fetch: webhookMiddleware,
    }
}

export default buildApp(parseEnvConfig(env as EnvConfig))
