import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useVehiclePartsStore } from './vehiclePartsStore'

type VehicleTile = {
  id: string
  parts: Map<string, string>
}

export const useVehicleStore = defineStore('vehicle', () => {
  const vehicleName = ref<string>(Date.now().toString())
  const vehicleId = ref<string>(Date.now().toString())
  const selectedTile = ref<string>('0 0')
  const vehicleTiles = ref<Map<string, VehicleTile>>(
    new Map([
      [
        '0 0',
        {
          id: '0 0',
          parts: new Map([['structure', 'frame_cross']]),
        },
      ],
      [
        '0 1',
        {
          id: '0 1',
          parts: new Map([['structure', 'frame_cross']]),
        },
      ],
      [
        '1 0',
        {
          id: '1 0',
          parts: new Map([['structure', 'frame_cross']]),
        },
      ],
      [
        '1 1',
        {
          id: '1 1',
          parts: new Map([['structure', 'frame_cross']]),
        },
      ],
    ]),
  )

  // Adds a part to a specific tile and location.
  // If the tile doesn't exist, create it. If the location doesn't exist in the parts map, it will be added.
  const addPart = (key: string, location: string, partId: string) => {
    console.log(key)
    console.log(location)
    console.log(partId)
    let tile = vehicleTiles.value.get(key)
    if (!tile) {
      tile = { id: key, parts: new Map<string, string>() }
      vehicleTiles.value.set(key, tile)
    }
    tile.parts.set(location, partId)
    console.log(vehicleTiles)
  }

  // Removes a part from a specific tile and location.
  // Safely no-ops if the tile or location doesn't exist.
  const removePart = (key: string, location: string) => {
    const tile = vehicleTiles.value.get(key)
    if (!tile) return
    tile.parts.delete(location)
  }

  // Adds a neighbor tile if missing
  function addNeighborIfMissing(direction: 'left' | 'right' | 'up' | 'down') {
    console.log('attempting to add a part')
    const [cxRaw, cyRaw] = selectedTile.value.split(' ')
    const cx = Number(cxRaw ?? 0)
    const cy = Number(cyRaw ?? 0)
    let nx = cx
    let ny = cy
    if (direction === 'left') nx = cx - 1
    if (direction === 'right') nx = cx + 1
    if (direction === 'up') ny = cy - 1
    if (direction === 'down') ny = cy + 1

    const key = `${nx} ${ny}`
    if (!vehicleTiles.value.has(key)) {
      let tile: VehicleTile = {
        id: key,
        parts: new Map([['structure', 'frame_cross']]),
      }
      vehicleTiles.value.set(key, tile)
    }
  }

  // Removes a tile from vehicleTiles by key and clears selection if needed
  const removeTile = (key: string) => {
    if (!vehicleTiles.value.has(key)) return

    vehicleTiles.value.delete(key)

    // If the removed tile was the selected one, clear or pick a fallback
    if (selectedTile.value === key) {
      // Optional: clear selection or pick another existing tile
      selectedTile.value = ''
    }
  }

  // Helper: compute grid bounds for blueprint
  const computeBounds = (): { minX: number; maxX: number; minY: number; maxY: number } => {
    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    vehicleTiles.value.forEach((_tile, key) => {
      const [xRaw, yRaw] = key.split(' ')
      const x = Number(xRaw)
      const y = Number(yRaw)
      if (Number.isFinite(x)) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
      }
      if (Number.isFinite(y)) {
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    })

    // defaults if no tiles
    if (!Number.isFinite(minX)) minX = 0
    if (!Number.isFinite(maxX)) maxX = 0
    if (!Number.isFinite(minY)) minY = 0
    if (!Number.isFinite(maxY)) maxY = 0

    return { minX, maxX, minY, maxY }
  }

  // 1) Get vehicle JSON object (not stringified)
  const getVehicleJson = (): any => {
    // Build parts array from tiles
    const partsArray = Array.from(vehicleTiles.value.entries()).map(([key, tile]) => {
      const [xRaw, yRaw] = key.split(' ')
      const x = Number(xRaw)
      const y = Number(yRaw)
      const partsList = Array.from(tile.parts.values())
      return { x, y, parts: partsList }
    })

    return {
      id: vehicleId.value,
      type: 'vehicle',
      name: vehicleName.value,
      parts: partsArray,
      items: [] as any[],
    }
  }

  // 2) Export as a pretty-printed JSON string
  const exportVehicleJsonString = (): string => {
    const obj = getVehicleJson()
    return JSON.stringify(obj, null, 2)
  }

  // Optional: export as raw JSON object (useful for further processing)
  const exportVehicleJson = (): any => getVehicleJson()

  return {
    vehicleName,
    vehicleId,
    selectedTile,
    vehicleTiles,
    addPart,
    removePart,
    addNeighborIfMissing,
    removeTile,
    exportVehicleJsonString,
    exportVehicleJson,
  }
})
