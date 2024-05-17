import * as core from "@actions/core"

import { State } from "./constants"

export function isExactKeyMatch(key: string, cacheKey?: string): boolean {
  return !!(
    cacheKey &&
    cacheKey.localeCompare(key, undefined, {
      sensitivity: "accent",
    }) === 0
  )
}

export function setCacheState(state: string): void {
  core.saveState(State.CacheMatchedKey, state)
}

export function getCacheState(): string | undefined {
  const cacheKey = core.getState(State.CacheMatchedKey)
  if (cacheKey) {
    core.debug(`Cache state/key: ${cacheKey}`)
    return cacheKey
  }

  return undefined
}

export function logWarning(message: string): void {
  const warningPrefix = "[warning]"
  core.info(`${warningPrefix}${message}`)
}

export function isError(x: unknown): x is Error {
  let e = x as Error
  return e.name !== undefined && e.message !== undefined
}
