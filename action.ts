import * as core from "@actions/core"
import * as utils from "./util"
import { exec } from "child_process"
import { promisify } from "util"
import { saveCache } from "cache"

const execShellCommand = promisify(exec)

type ExecRes = {
  stdout: string
  stderr: string
}

const printOutput = (res: ExecRes): void => {
  if (res.stdout) {
    core.info(res.stdout)
  }
  if (res.stderr) {
    core.info(res.stderr)
  }
}

export async function action(): Promise<void> {
  try {
    const startedAt = Date.now()

    try {
      let pkg = core.getInput("package")
      let cmd = `go install ${pkg}`

      const res = await execShellCommand(cmd)
      printOutput(res)

      core.info(`go-install-cache done`)
    } catch (exc) {
      // @ts-ignore
      printOutput(exc)

      // @ts-ignore
      if (exc.code === 1) {
        core.setFailed(`issues found`)
      } else {
        // @ts-ignore
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
