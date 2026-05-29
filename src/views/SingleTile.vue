<script setup lang="ts">
import { useVehiclePartsStore } from '@/stores/vehiclePartsStore'
import { useVehicleStore } from '@/stores/vehicleStore'

const vehiclePartsStore = useVehiclePartsStore()
const vehicleStore = useVehicleStore()

const locations = vehiclePartsStore.partLocations

const vehicleTiles = vehicleStore.vehicleTiles

const selectedTile = '0 0'

//console.log(vehicleTiles.get(selectedTile)?.parts.get('structure'))
</script>

<template>
  <div class="singleTile">
    <div class="location" v-for="loc in locations" :key="loc">
      <div class="header">{{ loc }}</div>
      <div class="part" :class="{ empty: !vehicleTiles.get(selectedTile)?.parts.get(loc) }">
        {{ vehicleTiles.get(selectedTile)?.parts.get(loc) || 'empty' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.singleTile {
  flex: 0 1 300px;
  height: 100vh;
  overflow-y: scroll;
}
.location {
  list-style: none;
  margin: 2px 4px 8px;
  padding: 2px 4px;
  border: 1px solid black;
  border-radius: 4px;
}
.header {
  font-weight: bold;
}
.location:has(.empty) {
  opacity: 33%;
}
</style>
