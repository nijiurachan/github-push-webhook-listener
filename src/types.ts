/**
 * Configuration required for the app parsed from environment variables
 */
export type AppConfig = {
    /** URL path to listen to webhook */
    urlPath: string
    /** GitHub webhook secret */
    secret: string
    /** Map of push origins to update scripts */
    scripts: Map<string, string>
}

/**
 * Finds and matches scripts based on repository and branch configurations
 */
export interface IScriptFinder {
    findScript(context: ScriptLookupContext): string | undefined
    makeKey(context: ScriptLookupContext): string
}

/**
 * Context for finding an appropriate update script
 */
export type ScriptLookupContext = {
    ref: string
    repoName: string
    fullName: string
}

/**
 * Responsible for running update scripts
 */
export interface IScriptRunner {
    runUpdate(
        script: string,
        ref: string,
        before: string,
        after: string,
    ): Promise<void>
}
