import type { IScriptFinder, IScriptRunner, ScriptLookupContext } from "./types"

/** Info about a push event from GitHub Webhook */
export type PushInfo = {
    ref: string
    before: string
    after: string
    repository: {
        name: string
        full_name: string
    }
}

/**
 * Handles webhook requests from GitHub
 */
export class PushHandler {
    constructor(
        private readonly scriptFinder: IScriptFinder,
        private readonly scriptRunner: IScriptRunner,
    ) {}

    /**
     * Handles push events from GitHub. Runs update script for the specified ref if it's configured.
     */
    async pullRepo({
        ref,
        repository,
        before,
        after,
    }: PushInfo): Promise<void> {
        const context = {
            ref,
            repoName: repository.name,
            fullName: repository.full_name,
        } satisfies ScriptLookupContext

        const fullKey = this.scriptFinder.makeKey(context)
        const path = this.scriptFinder.findScript(context)

        if (!path) {
            console.info(`Not configured for ${fullKey}. Ignoring.`)
            return
        }

        console.info(`Running update script for ${fullKey}`)
        await this.scriptRunner.runUpdate(path, context.ref, before, after)
    }
}
