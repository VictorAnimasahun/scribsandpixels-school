export function loadSaved(key: string): string | null {
  try {
    return localStorage.getItem(`snp-sandbox:${key}`)
  } catch {
    return null
  }
}

export function save(key: string, value: string) {
  try {
    localStorage.setItem(`snp-sandbox:${key}`, value)
  } catch {
    // storage unavailable: work just isn't kept
  }
}

export function remove(key: string) {
  try {
    localStorage.removeItem(`snp-sandbox:${key}`)
  } catch {
    // storage unavailable
  }
}
