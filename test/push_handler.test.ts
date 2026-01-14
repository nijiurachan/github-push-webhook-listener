import { describe, expect, it, jest } from "bun:test"
import { PushHandler } from "../src/push_handler"
import { ScriptFinder } from "../src/script_finder"

describe(PushHandler, () => {
    it.each([
        "main",
        "refs/heads/main",
        "repo:main",
        "repo:refs/heads/main",
        "user/repo:main",
        "user/repo:refs/heads/main",
    ])("runs update when a script is found (%s)", (key) => {
        const runUpdate = jest.fn()
        const handler = new PushHandler(
            new ScriptFinder(new Map([[key, "/foo/bar"]])),
            { runUpdate },
        )

        handler.pullRepo({
            ref: "refs/heads/main",
            before: "12345678",
            after: "90123456",
            repository: {
                name: "repo",
                full_name: "user/repo",
            },
        })

        expect(runUpdate).toBeCalledWith(
            "/foo/bar",
            "refs/heads/main",
            "12345678",
            "90123456",
        )
    })
})
