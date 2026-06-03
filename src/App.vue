<script setup lang="ts">
import VehiclePreview from './views/VehiclePreview.vue'
import SingleTile from './views/SingleTile.vue'
import PartsList from './views/PartsList.vue'
import { useVehiclePartsStore } from './stores/vehiclePartsStore'
import { onMounted } from 'vue'
import Loading from './components/Loading.vue'

const vehiclePartsStore = useVehiclePartsStore()

onMounted(() => {
  if (vehiclePartsStore.data.length === 0 && !vehiclePartsStore.loading) {
    vehiclePartsStore.fetchData()
  }
})
</script>

<template>
  <main>
    <div v-if="vehiclePartsStore.loading"><Loading /></div>
    <div v-else-if="vehiclePartsStore.error">Error: {{ vehiclePartsStore.error }}</div>
    <template v-else>
      <VehiclePreview></VehiclePreview>
      <SingleTile></SingleTile>
      <PartsList></PartsList>
    </template>
  </main>
</template>

<style scoped>
@media screen and (min-width: 960px) {
  main {
    display: flex;
  }
  main > * {
    flex: 1 1 auto;
    height: 100vh;
    padding: 0.5rem;
  }
}
</style>
