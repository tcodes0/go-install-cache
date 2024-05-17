import * as cache from "@actions/cache"
import * as core from "@actions/core"
import path from "path"

import { State } from "./constants"
import * as util from "./util"

const getCacheDir = (): string => {
  return path.resolve(`${process.env.HOME}/.cache/go-install-cache`)
}

async function buildCacheKeys(): Promise<string[]> {
  const keys = []

  let cacheKey = `go-install-cache.cache-${process.env?.RUNNER_OS}-`

  keys.push(cacheKey)

  return keys
}

export async function restoreCache(): Promise<void> {
  const startedAt = Date.now()

  const keys = await buildCacheKeys()
  const primaryKey = keys.pop()
  const restoreKeys = keys.reverse()

  if (!primaryKey) {
    util.logWarning(`Invalid primary key`)
    return
  }

  core.saveState(State.CachePrimaryKey, primaryKey)

  try {
    const cacheKey = await cache.restoreCache([getCacheDir()], primaryKey, restoreKeys)
    if (!cacheKey) {
      core.info(`Cache not found for input keys: ${[primaryKey, ...restoreKeys].join(", ")}`)
      return
    }

    // Store the matched cache key
    util.setCacheState(cacheKey)
    core.info(`Restored cache for go-install-cache from key '${primaryKey}' in ${Date.now() - startedAt}ms`)
  } catch (error) {
    if (!util.isError(error)) {
      throw error
    }

    if (error.name === cache.ValidationError.name) {
      throw error
    } else {
      core.warning(error.message)
    }
  }
}

export async function saveCache(): Promise<void> {
  const startedAt = Date.now()

  const cacheDirs = [getCacheDir()]
  const primaryKey = core.getState(State.CachePrimaryKey)
  if (!primaryKey) {
    util.logWarning(`Error retrieving key from state.`)
    return
  }

  const state = util.getCacheState()

  if (util.isExactKeyMatch(primaryKey, state)) {
    core.info(`Cache hit occurred on the primary key ${primaryKey}, not saving cache.`)
    return
  }

  try {
    await cache.saveCache(cacheDirs, primaryKey)
    core.info(`Saved cache for go-install-cache from paths '${cacheDirs.join(`, `)}' in ${Date.now() - startedAt}ms`)
  } catch (error) {
    if (!util.isError(error)) {
      throw error
    }

    if (error.name === cache.ValidationError.name) {
      throw error
    } else if (error.name === cache.ReserveCacheError.name) {
      core.info(error.message)
    } else {
      core.info(`[warning] ${error.message}`)
    }
  }
}
