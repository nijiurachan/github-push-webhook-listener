import type { IScriptFinder, ScriptLookupContext } from "./types"

export class ScriptFinder implements IScriptFinder {
    constructor(private paths: Map<string, string>) {}

    makeKey({ ref, repoName, userName }: ScriptLookupContext): string {
        return `${userName}/${repoName}:${ref}`
    }

    findScript(context: ScriptLookupContext): string | undefined {
        const { ref, repoName, userName } = context
        const branchName = ref.replace(/^refs\/heads\//, "")
        return this.match([
            branchName,
            ref,
            `${repoName}:${ref}`,
            this.makeKey({ ref, repoName, userName }),
            `${userName}/${repoName}:${branchName}`,
        ])
    }

    private match(keys: string[]): string | undefined {
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
}
