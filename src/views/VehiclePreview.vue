<template>
  <div class="vehiclePreview" ref="wrap">
    <section
      class="game-grid"
      :style="[gridStyle, { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }]"
      ref="grid"
    >
      <div
        v-for="[coords, tile] in tileEntries"
        :key="coords"
        class="tile"
        :class="{ selected: coords == selectedTile }"
        :style="tileStyle(coords)"
        @click="handleTileClick(coords)"
      >
        <span class="coords">{{ coords }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore' // adjust path as needed
import { storeToRefs } from 'pinia'

// Pinia store that holds the vehicle tiles
const store = useVehicleStore()
const { vehicleTiles, selectedTile } = storeToRefs(store)

// Convert Map to array for iteration
const tileEntries = computed(() => Array.from(vehicleTiles.value.entries()))

// DOM refs
const wrap = ref<HTMLElement | null>(null)
const grid = ref<HTMLElement | null>(null)

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

// Translate so selected tile centers
const offset = ref({ x: 0, y: 0 })

function centerOnSelected() {
  const [sx, sy] = selectedTile.value.split(' ').map((n) => Number(n) || 0)

  // container center (wrap may resize; measure grid size for centering)
  const wrapEl = wrap.value
  const gridEl = grid.value
  if (!wrapEl || !gridEl) return

  const wrapRect = wrapEl.getBoundingClientRect()
  const gridRect = gridEl.getBoundingClientRect()

  // Center of selected tile in grid coordinates (pixel space)
  const tileCenterX = sx * TILE + TILE / 2
  const tileCenterY = sy * TILE + TILE / 2

  // Center of the wrap in global pixels
  const wrapCenterX = wrapRect.left + wrapRect.width / 2
  const wrapCenterY = wrapRect.top + wrapRect.height / 2

  // Offset to apply to grid so the tile center aligns with wrap center
  // Convert grid's local (0,0) to wrap's center
  const gridOriginX = gridRect.left
  const gridOriginY = gridRect.top

  // Desired top-left of grid so that tileCenter aligns with wrap center
  const targetX = wrapCenterX - (tileCenterX - gridOriginX)
  const targetY = wrapCenterY - (tileCenterY - gridOriginY)

  // Since we apply transform on the grid, offset is the delta from 0,0
  offset.value = {
    x: targetX - gridOriginX,
    y: targetY - gridOriginY,
  }
}

// Resize observer to keep centering on resize
let ro: ResizeObserver | null = null
onMounted(() => {
  centerOnSelected()
  ro = new ResizeObserver(() => centerOnSelected())
  if (wrap.value) ro.observe(wrap.value)
  if (grid.value) ro.observe(grid.value)
})
onBeforeUnmount(() => ro?.disconnect())

// Re-center when selected tile changes
watch(
  () => selectedTile.value,
  () => centerOnSelected(),
)

function handleTileClick(coords: string) {
  console.log(typeof coords)
  selectedTile.value = coords
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
  cursor: pointer;
}
.tile.selected {
  border: 2px solid #2c2c2c;
}
</style>
