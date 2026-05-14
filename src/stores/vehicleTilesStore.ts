import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useVehiclePartsStore } from './vehiclePartsStore'

type VehicleTile = {
  id: string
  parts: Map<string, string>
}

export const useVehicleTilesStore = defineStore('vehicleTiles', () => {
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

  return {
    vehicleTiles,
  }
})
