<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVehiclePartsStore } from '@/stores/vehiclePartsStore'
import { useVehicleStore } from '@/stores/vehicleStore'

const vehiclePartsStore = useVehiclePartsStore()
const vehicleStore = useVehicleStore()

const locations = vehiclePartsStore.partLocations

const { vehicleName, vehicleId, vehicleTiles, selectedTile } = storeToRefs(vehicleStore)

const exportVehicleJsonString = vehicleStore.exportVehicleJsonString
const exportVehicleJson = vehicleStore.exportVehicleJson
console.log(exportVehicleJson())
const saveToLocalStorage = vehicleStore.saveToLocalStorage
const loadFromLocalStorage = vehicleStore.loadFromLocalStorage

const nonEmptyLocations = computed(() => {
  const partsMap = vehicleTiles.value.get(selectedTile.value)?.parts
  if (!partsMap) return [] as string[]
  return Array.from(locations).filter((loc) => !!partsMap.get(loc))
})

const removePart = (tileKey: string, location: string) => {
  const tile = vehicleTiles.value.get(tileKey)
  if (!tile) return
  tile.parts.delete(location)
}

function exportToClipboard() {
  navigator.clipboard.writeText(JSON.stringify(exportVehicleJson()))
}
</script>

<template>
  <div class="singleTile">
    <div class="actions">
      <div class="info">
        <label for="vehicleName"><span>Name</span></label>
        <input type="text" id="vehicleName" v-model="vehicleName" />
        <label for="vehicleId"><span>Id</span></label>
        <input type="text" id="vehicleId" v-model="vehicleId" />
      </div>
      <button @click="saveToLocalStorage">save</button>
      <button @click="loadFromLocalStorage">load</button>
      <button @click="exportToClipboard">export to clipboard</button>
    </div>
    <div class="location" v-for="loc in nonEmptyLocations" :key="loc">
      <div class="header">
        {{ loc }}
        <button @click="removePart(selectedTile, loc)">X</button>
      </div>
      <div class="part">
        {{ vehicleTiles.get(selectedTile)?.parts.get(loc) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.singleTile {
  flex: 0 1 300px;
  overflow-y: scroll;
}
.location {
  list-style: none;
  margin: 2px 0 8px;
  padding: 2px 4px;
  border: 1px solid black;
  border-radius: 4px;
}
.header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
button {
  cursor: pointer;
}
.location:has(.empty) {
  opacity: 33%;
}
.info {
  display: grid;
  grid-template-columns: 1fr 3fr;
}
</style>
