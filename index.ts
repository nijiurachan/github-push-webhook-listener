import { createHmac } from "node:crypto";
import { env } from "node:process";
import { $ } from "bun";

const WEBHOOK_SECRET = env.WEBHOOK_SECRET || "";

const PATHS: Map<string, string> = new Map([
    ["refs/heads/main", "/var/www/my-forum-prod"],
    ["refs/heads/dev", "/var/www/my-forum-devel"],
]);

if (!WEBHOOK_SECRET) {
    throw Error("Specify WEBHOOK_SECRET via env variable");
}

async function parsePost(req: Request): Promise<string | undefined> {
    const signature = req.headers.get("x-hub-signature-256");
    const payload = await req.text();

    if (!verifyGitHubSignature(WEBHOOK_SECRET, payload, signature)) {
        return;
    }

    const event = req.headers.get("x-github-event");
    if (event !== "push") {
        return;
    }

    return JSON.parse(payload);
}

async function runUpdate(path: string): Promise<void> {
    await $`bash ${path}/cli/update_deploy.sh`;
}

function verifyGitHubSignature(secret: string, payload: string, signature: string | undefined | null): boolean {
    // https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
    if (!signature || signature.length !== 71) {
        return false;
    }
    const hmac = createHmac("sha256", secret).update(payload);
    return signature === `sha256=${hmac.digest("hex")}`;
}

async function handleWebhook(req: Request): Promise<Response> {
    const ref = await parsePost(req);
    if (!ref) {
        return new Response("Unauthorized", { status: 401 });
    }

    const path = PATHS.get(ref);
    if (!path) {
        return new Response("OK", { status: 200 });
    }

    try {
        await runUpdate(path);

        return new Response("Accepted", { status: 202 });
    } catch (error) {
        const msg = error && typeof error === "object" && "message" in error ? error.message : "Unknown";
        return new Response(`Error: ${msg}`, { status: 500 });
    }
}

async function handleStatus(req: Request): Promise<Response> {
    return new Response(
        JSON.stringify(req.headers),
        {
            status: 200,
            headers: { "Content-Type": "application/json" }
        },
    );
}

export default {
    routes: {
        "/__admin/webhook": {
            POST: handleWebhook,
        },
        "/__admin/status": {
            GET: handleStatus,
        },
    },
};
