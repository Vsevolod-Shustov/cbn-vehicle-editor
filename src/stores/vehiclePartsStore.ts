import { ref } from 'vue'
import { defineStore } from 'pinia'
import sortSet from '@/helpers/sortSet'

const BASE_URL =
  'https://raw.githubusercontent.com/cataclysmbn/Cataclysm-BN/refs/heads/main/data/json/vehicleparts/'
const fileNames = [
  'aisle',
  'alternator',
  'armor',
  'balloons',
  'battery',
  'boards',
  'cables',
  'cargo',
  'combustion',
  'controls',
  'crafting',
  'doors',
  'engine',
  'engineering',
  'farming',
  'faults',
  'flags',
  'frames',
  'funnels',
  'furniture',
  'hulls',
  'jets',
  'ladders',
  'lights',
  'manual',
  'mirrors',
  'misc',
  'plating',
  'portal_tap',
  'power',
  'propellers',
  'rams',
  'roofs',
  'rotor',
  'seats',
  'shutters',
  'sound',
  'tanks',
  'temperature',
  'turret',
  'vp_flags',
  'wheel',
  'windshields',
  'wings',
]

type Part = {
  id?: string
  location?: string
  abstract?: string
  'copy-from'?: string
  flags?: string[]
  delete?: {
    flags?: string[]
  }
}

type DataFlatArray = Part[]

export const useVehiclePartsStore = defineStore('vehicleParts', () => {
  const data = ref<DataFlatArray>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const partLocations = ref<Set<string>>(new Set())

  const fetchData = async () => {
    loading.value = true
    error.value = null

    const promises = fileNames.map(async (name) => {
      const url = `${BASE_URL}${name}.json`
      const resp = await fetch(url)
      if (!resp.ok)
        throw new Error(`Failed to fetch ${name}.json: ${resp.status} ${resp.statusText}`)
      return await resp.json()
    })

    const results = await Promise.allSettled(promises)

    const flat: DataFlatArray = []
    const errors: string[] = []

    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        const items = r.value as Part[]
        flat.push(...items)
        items.forEach((part: any) => {
          if (part?.location) partLocations.value.add(part.location)
        })
      } else {
        errors.push((r.reason as Error)?.message ?? 'Unknown fetch error')
      }
    })

    const resolveFromReferences = (id?: string) => {
      const seen: string[] = []
      let currentId = id
      let resolvedLocation: string | undefined
      const resolvedFlags: string[] = []
      const accumulatedDeleteFlags: string[] = []

      while (currentId && !seen.includes(currentId)) {
        seen.push(currentId)
        const part = flat.find((p) => p.id === currentId || p.abstract === currentId)
        if (!part) break

        if (!resolvedLocation && part.location) {
          resolvedLocation = part.location
        }

        if (part.flags && part.flags.length > 0) {
          resolvedFlags.push(...part.flags)
        }

        if (part.delete?.flags && part.delete.flags.length > 0) {
          accumulatedDeleteFlags.push(...part.delete.flags)
        }

        currentId = part['copy-from']
      }

      const uniqueFlags = Array.from(new Set(resolvedFlags))

      return {
        location: resolvedLocation,
        flags: uniqueFlags,
        deleteFlags: Array.from(new Set(accumulatedDeleteFlags)),
      }
    }

    flat.forEach((part) => {
      const { location, flags, deleteFlags } = resolveFromReferences(part.id)
      if (!part.location && location) part.location = location
      if ((!part.flags || part.flags.length === 0) && flags?.length) part.flags = flags

      const currentFlags = part.flags ? [...part.flags] : []
      if (deleteFlags && deleteFlags.length > 0) {
        const filtered = currentFlags.filter((f) => !deleteFlags.includes(f))
        part.flags = filtered.length > 0 ? filtered : part.flags
      }
    })

    data.value = flat.sort((a, b) => (a?.id || '').localeCompare(b?.id || ''))
    sortSet(partLocations.value)

    if (errors.length) error.value = errors.join('; ')
    loading.value = false
  }

  return {
    data,
    loading,
    error,
    partLocations,
    fetchData,
  }
})
