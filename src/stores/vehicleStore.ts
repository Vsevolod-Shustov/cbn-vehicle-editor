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

  const LOCAL_KEY = 'cbn_vehicle_save'

  // Prepare a serializable snapshot of the current state
  const snapshot = (): any => {
    // Convert Map<string, VehicleTile> to a plain array for JSON
    const tiles = Array.from(vehicleTiles.value.entries()).map(([key, tile]) => {
      return {
        key,
        id: tile.id,
        parts: Array.from(tile.parts.entries()), // [[location, partId], ...]
      }
    })

    return {
      name: vehicleName.value,
      id: vehicleId.value,
      selectedTile: selectedTile.value,
      tiles,
    }
  }

  // Restore from a plain snapshot
  const hydrate = (data: any) => {
    if (!data) return

    if (data.name !== undefined) vehicleName.value = data.name
    if (data.id !== undefined) vehicleId.value = data.id
    if (data.selectedTile !== undefined) selectedTile.value = data.selectedTile

    // Rebuild vehicleTiles Map from tiles array
    const map = new Map<string, VehicleTile>()
    if (Array.isArray(data.tiles)) {
      data.tiles.forEach((t: any) => {
        const m = new Map<string, string>(t.parts ?? [])
        map.set(t.key, { id: t.key, parts: m })
      })
    }
    vehicleTiles.value = map
  }

  // Save current state to localStorage
  const saveToLocalStorage = (): void => {
    console.log('attempting to save to local storage')
    try {
      const data = snapshot()
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
      // Optional: signal success
      console.log('saved to local storage')
    } catch (e) {
      console.error('Failed to save vehicle to localStorage', e)
    }
  }

  // Load state from localStorage
  const loadFromLocalStorage = (): void => {
    console.log('attempting to load from local storage')
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      hydrate(data)
      console.log('loaded from local storage')
    } catch (e) {
      console.error('Failed to load vehicle from localStorage', e)
    }
  }

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
    saveToLocalStorage,
    loadFromLocalStorage,
  }
})
