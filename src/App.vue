<script setup lang="ts">
import VehiclePreview from './views/VehiclePreview.vue'
import SingleTile from './views/SingleTile.vue'
import PartsList from './views/PartsList.vue'
import { useVehiclePartsStore } from './stores/vehiclePartsStore'
import { onMounted } from 'vue'
import Loading from './components/Loading.vue'

const store = useVehiclePartsStore()

onMounted(() => {
  if (store.data.length === 0 && !store.loading) {
    store.fetchData()
  }
})
</script>

<template>
  <main>
    <div v-if="store.loading"><Loading /></div>
    <div v-else-if="store.error">Error: {{ store.error }}</div>
    <template v-else>
      <VehiclePreview></VehiclePreview>
      <SingleTile></SingleTile>
      <PartsList></PartsList>
    </template>
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
