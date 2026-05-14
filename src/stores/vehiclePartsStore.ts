import { ref } from 'vue'
import { defineStore } from 'pinia'

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
        // Flatten
        const items = r.value as Part[]
        flat.push(...items)
        items.forEach((part: any) => {
          const loc = part?.location ?? null
          if (loc) partLocations.value.add(loc)
        })
      } else {
        errors.push((r.reason as Error)?.message ?? 'Unknown fetch error')
      }
    })

    flat.forEach((part) => {
      if (!part.location && !part.abstract) {
        part.location = copyLocationFromReferences(flat, part.id)
      }
    })

    data.value = flat.sort((a, b) => (a?.id || '').localeCompare(b?.id || ''))
    //console.log('loaded ' + flat.length + ' parts')
    if (errors.length) error.value = errors.join('; ')

    loading.value = false
  }

  const copyLocationFromReferences = (flatData: DataFlatArray, id?: string): string | undefined => {
    const part = flatData.find((p) => p.id === id || p.abstract === id)
    //const partIdOrAbstract = part?.id || part?.abstract || null
    //console.log('part: ' + partIdOrAbstract)
    if (part) {
      if (part.location) {
        //console.log('found location field on part: ' + partIdOrAbstract)
        //console.log('======')
        return part.location
      }
      if (part['copy-from']) {
        //console.log('continuing lookup to ' + part['copy-from'])
        //console.log('======')
        return copyLocationFromReferences(flatData, part['copy-from'])
      }
    }
    return undefined
  }

  return {
    data,
    loading,
    error,
    partLocations,
    fetchData,
  }
})
