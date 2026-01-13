/**
 * Configuration required for the app parsed from environment variables
 */
export type AppConfig = {
    /** URL path to listen to webhook */
    urlPath: string
    /** GitHub webhook secret */
    secret: string
    /** Map of refs to update scripts */
    scripts: Map<string, string>
}
