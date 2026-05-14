export default function sortSet(set: Set<any>) {
  const entries = []
  for (const member of set) {
    entries.push(member)
  }
  set.clear()
  for (const entry of entries.sort()) {
    set.add(entry)
  }
  return set
}
