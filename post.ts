import { saveCache } from "cache"
import * as core from "@actions/core"
import * as utils from "./util"

export async function postRun(): Promise<void> {
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
