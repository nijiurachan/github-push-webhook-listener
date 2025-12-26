import { exists } from "node:fs/promises"
import type { EmitterWebhookEvent, Webhooks } from "@octokit/webhooks"
import { $ } from "bun"

/**
 * Handles webhook requests from GitHub
 */
export class PushHandler {
    constructor(private paths: Map<string, string>) {}

    /** Registers webhook listener */
    listenTo(hooks: Webhooks<unknown>): void {
        hooks.on("push", (event) => this.pullRepo(event))
        hooks.onError((event) => console.error(event))
    }

    /**
     * Handles push events from GitHub. Runs update script for the specified ref if it's configured.
     */
    private async pullRepo(event: EmitterWebhookEvent<"push">): Promise<void> {
        const { ref, before, after } = event.payload

        const path = this.paths.get(ref.replace(/^refs\/heads\//, ""))
        if (!path) {
            console.info(`Not configured for ${ref}; Ignoring`)
            return
        }

        console.info(`Running update script for ${ref}`)
        await this.runUpdate(path, ref, before, after)
    }

    /**
     * Runs update script for the specified path
     */
    private async runUpdate(
        script: string,
        ref: string,
        before: string,
        after: string,
    ): Promise<void> {
        if (!exists(script)) {
            throw Error(`Script ${script} does not exist`)
        }
        console.info({
            running: `/bin/bash -- ${script} ${ref} ${before} ${after}`,
        })
        await $`/bin/bash -- ${script} ${ref} ${before} ${after}`
    }
}
