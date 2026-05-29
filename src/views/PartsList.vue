<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVehiclePartsStore } from '@/stores/vehiclePartsStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { Part } from '@/stores/vehiclePartsStore'

const vehiclePartsStore = useVehiclePartsStore()
const vehicleStore = useVehicleStore()

const locationList = vehiclePartsStore.partLocations ?? null

const selectedLocation = ref<string | null>(null)
const showFoldableOnly = ref(false) // New ref for checkbox state

function selectLocation(loc: string) {
  selectedLocation.value = loc
}

function clearLocation() {
  selectedLocation.value = null
}

const filteredParts = computed(() => {
  if (!vehiclePartsStore.data || vehiclePartsStore.data.length === 0) return []

  let parts = vehiclePartsStore.data.filter((p: any) => !p?.abstract && p?.type !== 'json_flag')

  if (selectedLocation.value) {
    parts = parts.filter((p: any) => {
      const loc = p?.location ?? null
      return loc === selectedLocation.value
    })
  }

  if (showFoldableOnly.value) {
    parts = parts.filter((p: any) => p?.flags?.includes('FOLDABLE'))
  }

  console.log(parts)
  return parts
})

function handlePartClick(part: Part) {
  console.log(part)
}
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
      <div>
        <label>
          <input type="checkbox" v-model="showFoldableOnly" />
          Show only foldable parts
        </label>
      </div>
    </div>
    <ul>
      <li v-for="part in filteredParts" :key="part.id" class="part" @click="handlePartClick(part)">
        {{ part?.id }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.partsList {
  flex: 0 1 350px;
  height: 100vh;
  overflow-y: scroll;
}
.part {
  cursor: pointer;
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
