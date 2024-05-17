import * as core from "@actions/core"
import * as utils from "./util"
import { exec } from "child_process"
import { promisify } from "util"
import { restoreCache, saveCache } from "cache"

const execShellCommand = promisify(exec)

export async function action(): Promise<void> {
  try {
    const startedAt = Date.now()
    let pkg = core.getInput("package")
    await restoreCache(pkg)

    try {
      let cmd = `go install ${pkg}`

      const res = await execShellCommand(cmd)
      utils.printOutput(res)
    } catch (exc) {
      if (!utils.isExecRes(exc)) {
        throw exc
      }

      utils.printOutput(exc)
      if (exc.code) {
        core.setFailed(`go-install-cache exit with code ${exc.code}`)
      }
    }

    core.info(`Ran go-install-cache in ${Date.now() - startedAt}ms`)
  } catch (error) {
    if (!utils.isError(error)) {
      throw error
    }

    core.error(`Failed to run: ${error}, ${error.stack}`)
    core.setFailed(error.message)
  }
}

export async function post(): Promise<void> {
  try {
    await saveCache()
  } catch (error) {
    if (!utils.isError(error)) {
      throw error
    }

    core.error(`Failed to post-run: ${error}, ${error.stack}`)
    core.setFailed(error.message)
  }
}
