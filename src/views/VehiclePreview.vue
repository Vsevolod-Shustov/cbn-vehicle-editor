<template>
  <div class="vehiclePreview">
    <section class="game-grid" :style="gridStyle">
      <div
        v-for="[coords, tile] in tileEntries"
        :key="coords"
        class="tile"
        :style="tileStyle(coords)"
      >
        <span class="coords">{{ coords }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore' // adjust path as needed
import { storeToRefs } from 'pinia'

// Pinia store that holds the vehicle tiles
const store = useVehicleStore()
const { vehicleTiles } = storeToRefs(store)

// Convert Map to array for iteration
const tileEntries = computed(() => Array.from(vehicleTiles.value.entries()))

// Tile size (in pixels)
const TILE = 32

const maxX = computed(() =>
  Math.max(0, ...tileEntries.value.map(([coords]) => Number(coords.split(' ')[0]))),
)
const maxY = computed(() =>
  Math.max(0, ...tileEntries.value.map(([coords]) => Number(coords.split(' ')[1]))),
)

const gridStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: `${(maxX.value + 1) * TILE}px`,
  height: `${(maxY.value + 1) * TILE}px`,
  overflow: 'hidden',
}))

const tileStyle = (coords: string): CSSProperties => {
  const parts = coords.split(' ')
  const x = Number(parts[0] ?? 0)
  const y = Number(parts[1] ?? 0)

  return {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: `${x * TILE}px`,
    top: `${y * TILE}px`,
    width: `${TILE}px`,
    height: `${TILE}px`,
  }
}
</script>

<style scoped>
.vehiclePreview {
  flex: 1 1 auto;
}
.tile {
  border: 1px solid #2c2c2c;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: sans-serif;
  font-size: 10px;
  text-align: center;
  overflow: hidden;
  position: absolute;
}
</style>
