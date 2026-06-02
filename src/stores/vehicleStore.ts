import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useVehiclePartsStore } from './vehiclePartsStore'

type VehicleTile = {
  id: string
  parts: Map<string, string>
}

export const useVehicleStore = defineStore('vehicle', () => {
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

  return {
    selectedTile,
    vehicleTiles,
    addPart,
    removePart,
  }
})
