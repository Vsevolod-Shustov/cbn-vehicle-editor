import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTilesetStore = defineStore('tileset', () => {
  const BASE_URL =
    'https://raw.githubusercontent.com/cataclysmbn/Cataclysm-BN/refs/heads/main/gfx/MSX%2B%2BUnDeadPeopleEdition/'
  const tilesConfig = ref<string | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Updated loader with loading and error handling
  const loadRawJson = async (): Promise<void> => {
    // reset state
    loading.value = true
    error.value = null
    try {
      const url = `${BASE_URL}tile_config.json`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      tilesConfig.value = await res.json()
    } catch (e: any) {
      error.value = e?.message ?? 'Unknown error'
      console.error('Failed to load raw tile_config.json', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Recursively search a JSON structure for an object with a matching id
   * and return its fg value (number) and the associated file (string) if found.
   * If not found, returns undefined.
   */
  type Result = { fg: number; file: string } | undefined

  function findFgAndFileById(root: any, targetId: string): Result {
    const dfs = (node: any, currentFile?: string): Result => {
      if (node && typeof node === 'object') {
        // update current file if this node defines one
        if (typeof node.file === 'string') {
          currentFile = node.file
        }

        // direct match at this node
        if ('id' in node && node.id === targetId && 'fg' in node) {
          if (typeof node.fg === 'number' && typeof currentFile === 'string') {
            return { fg: node.fg, file: currentFile }
          }
          // If fg exists but file isn't tracked yet, still return with undefined file
          return typeof node.fg === 'number' ? { fg: node.fg, file: currentFile ?? '' } : undefined
        }

        // traverse arrays
        if (Array.isArray(node)) {
          for (const item of node) {
            const v = dfs(item, currentFile)
            if (v !== undefined) return v
          }
        } else {
          // traverse object properties
          for (const key of Object.keys(node)) {
            const v = dfs(node[key], currentFile)
            if (v !== undefined) return v
          }
        }
      }
      return undefined
    }

    // start with no current file
    return dfs(root)
  }

  return {
    tilesConfig,
    loading,
    error,
    BASE_URL,
    loadRawJson,
    findFgAndFileById,
  }
})
