import type { AppConfig } from "./types"

/**
 * Configuration items from environment variables
 */
export type EnvConfig = {
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
            `Specify HOOK_SCRIPTS as a JSON object (e.g. HOOK_SCRIPTS='{"nijiurachan/myapp:main": "/var/www/myapp-prod/update_deploy.sh", "nijiurachan/myapp:dev": "/var/www/myapp-devel/update_deploy.sh"}')`,
            { cause: e },
        )
    }
}
