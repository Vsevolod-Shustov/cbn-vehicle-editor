<script setup lang="ts">
import VehiclePreview from './views/VehiclePreview.vue'
import SingleTile from './views/SingleTile.vue'
import PartsList from './views/PartsList.vue'
import { useVehiclePartsStore } from './stores/vehiclePartsStore'
import { onMounted } from 'vue'

const store = useVehiclePartsStore()

onMounted(() => {
  if (store.data.length === 0 && !store.loading) {
    store.fetchData()
  }
})
</script>

<template>
  <main>
    <VehiclePreview></VehiclePreview>
    <SingleTile></SingleTile>
    <PartsList></PartsList>
    <!-- <div v-if="store.loading">Loading parts...</div>
    <div v-else-if="store.error">Error: {{ store.error }}</div>
    <ul v-else>
      <li v-for="(part, idx) in store.data" :key="idx">
        {{ part }}
      </li>
    </ul> -->
  </main>
</template>

<style scoped>
main {
  display: flex;
}
main > * {
  flex: 1 1 auto;
  height: 100vh;
}
</style>
