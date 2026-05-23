import { access, constants, exists } from "node:fs/promises"
import { spawn } from "bun"
import type { IScriptRunner } from "./types"

export class ScriptRunner implements IScriptRunner {
    constructor(private shellCommand: string[]) {}

    async runUpdate(
        script: string,
        ref: string,
        before: string,
        after: string,
    ): Promise<void> {
        if (!(await exists(script))) {
            throw Error(`Script ${script} does not exist`)
        }

        const isExecutable = await access(script, constants.X_OK)
            .then(() => true)
            .catch(() => false)
        const prefix = isExecutable ? [] : this.shellCommand
        const command = [...prefix, script, ref, before, after]

        console.info({ spawn: command })
        spawn(command).unref()
    }
}
