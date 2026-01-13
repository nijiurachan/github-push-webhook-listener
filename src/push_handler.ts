import { exists } from "node:fs/promises"
import type { EmitterWebhookEvent, Webhooks } from "@octokit/webhooks"
import { spawn } from "bun"

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
        const { ref, repository, before, after } = event.payload

        if (!repository?.owner?.login) {
            console.info("No repository information in webhook payload")
            return
        }

        const branchName = ref.replace(/^refs\/heads\//, "")
        const fullKey = `${repository.owner.login}/${repository.name}:${ref}`
        const path = this.findScript([
            branchName,
            ref,
            `${repository.name}:${ref}`,
            fullKey,
            `${repository.owner.login}/${repository.name}:${branchName}`,
        ])
        if (!path) {
            console.info(`Not configured for ${fullKey}. Ignoring.`)
            return
        }

        console.info(`Running update script for ${fullKey}`)
        await this.runUpdate(path, ref, before, after)
    }

    findScript(keys: string[]): string | undefined {
        const matchingPaths = keys.filter((candidate) =>
            this.paths.has(candidate),
        )

        if (1 < matchingPaths.length) {
            throw new Error(
                `Ambiguous configuration: multiple matches found for ${keys.join(", ")}.`,
            )
        }

        return this.paths.get(matchingPaths[0] ?? "")
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
        if (!(await exists(script))) {
            throw Error(`Script ${script} does not exist`)
        }
        console.info({
            spawn: `/bin/bash -- ${script} ${ref} ${before} ${after}`,
        })
        spawn([`/bin/bash`, "--", script, ref, before, after]).unref()
    }
}
