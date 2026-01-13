import { createWebMiddleware, Webhooks } from "@octokit/webhooks"
import type { Serve } from "bun"
import { PushHandler } from "./push_handler"
import { ScriptFinder } from "./script_finder"
import { ScriptRunner } from "./script_runner"
import type { AppConfig } from "./types"

/** Builds the app */
export function buildApp({
    secret,
    urlPath,
    scripts,
}: AppConfig): Serve.Options<void> {
    const handler = new PushHandler(
        new ScriptFinder(scripts),
        new ScriptRunner(["/bin/bash", "--"]),
    )

    const hooks = new Webhooks({ secret })
    hooks.on("push", ({ payload }) => handler.pullRepo(payload))
    hooks.onError((event) => console.error(event))

    const webhookMiddleware = createWebMiddleware(hooks, { path: urlPath })

    return {
        fetch: webhookMiddleware,
    }
}
