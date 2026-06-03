import { ref } from 'vue'
import { defineStore } from 'pinia'

const BASE_URL =
  'https://raw.githubusercontent.com/cataclysmbn/Cataclysm-BN/refs/heads/main/gfx/MSX%2B%2BUnDeadPeopleEdition/'

export const useTilesetStore = defineStore('tileset', () => {
  // State declarations (add to your store/script)
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
   * and return its fg value (number) if found.
   * If not found, returns undefined.
   */
  function findFgById(root: any, targetId: string): number | undefined {
    const dfs = (node: any): number | undefined => {
      if (node && typeof node === 'object') {
        // direct match at this node
        if ('id' in node && node.id === targetId && 'fg' in node) {
          return node.fg as number
        }

        // traverse arrays
        if (Array.isArray(node)) {
          for (const item of node) {
            const v = dfs(item)
            if (v !== undefined) return v
          }
        } else {
          // traverse object properties
          for (const key of Object.keys(node)) {
            const v = dfs(node[key])
            if (v !== undefined) return v
          }
        }
      }
      return undefined
    }

    return dfs(root)
  }

  return {
    tilesConfig,
    loading,
    error,
    loadRawJson,
    findFgById,
  }
})
