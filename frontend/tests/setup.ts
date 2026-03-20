// test setup — add global mocks here if needed

// Node 22+ ships a built-in localStorage that lacks .clear() and conflicts
// with jsdom's full implementation. Provide a minimal Storage polyfill so
// tests can use localStorage.clear(), .getItem(), .setItem(), .removeItem().
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.clear !== 'function') {
  const store = new Map<string, string>()
  const storage: Storage = {
    getItem(key: string) {
      return store.get(key) ?? null
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
    removeItem(key: string) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    get length() {
      return store.size
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    writable: true,
    configurable: true,
  })
}
