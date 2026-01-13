import { createWebMiddleware, Webhooks } from "@octokit/webhooks"
import type { Serve } from "bun"
import { PushHandler } from "./push_handler"
import type { AppConfig } from "./types"

/** Builds the app */
export function buildApp({
    secret,
    urlPath,
    scripts,
}: AppConfig): Serve.Options<void> {
    const hooks = new Webhooks({ secret })
    const handler = new PushHandler(scripts)
    handler.listenTo(hooks)

    const webhookMiddleware = createWebMiddleware(hooks, { path: urlPath })

    return {
        fetch: webhookMiddleware,
    }
}
