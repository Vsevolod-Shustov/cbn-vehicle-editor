<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVehiclePartsStore } from '@/stores/vehiclePartsStore'

const store = useVehiclePartsStore()
const locationList = store.partLocations ?? null

const selectedLocation = ref<string | null>(null)

function selectLocation(loc: string) {
  selectedLocation.value = loc
}

function clearLocation() {
  selectedLocation.value = null
}

const filteredParts = computed(() => {
  if (!store.data || store.data.length === 0) return []
  if (!selectedLocation.value)
    return store.data.filter((p: any) => {
      return p?.abstract ? false : true
    })

  return store.data.filter((p: any) => {
    const loc = (p?.location ?? null) as string | null
    return loc ? loc === selectedLocation.value && !p?.abstract : false
  })
})
</script>

<template>
  <div class="partsList">
    <div class="filters" aria-label="filter by location">
      <button @click="clearLocation" :class="{ active: selectedLocation === null }">All</button>
      <button
        v-for="loc in locationList"
        :key="loc"
        @click="selectLocation(loc)"
        :class="{ active: loc === selectedLocation }"
      >
        {{ loc }}
      </button>
    </div>
    <ul>
      <li v-for="part in filteredParts" :key="part.id">
        {{ part?.id }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.partsList {
  flex: 0 1 300px;
}
ul {
  padding: 0;
}
li {
  list-style: none;
}
.filters {
  display: flex;
  flex-wrap: wrap;
}
.filters button {
  cursor: pointer;
  background-color: white;
  margin: 2px;
  padding: 2px;
  border: 1px solid black;
  border-radius: 4px;
  flex: 1 1 auto;
}
.filters button.active {
  background-color: deepskyblue;
}
</style>
