export type LibraryMovie = {
  source: string
  slug: string
  name: string
  originName?: string
  thumb?: string
  poster?: string
  episode?: string
  quality?: string
  lang?: string
  year?: number
  updatedAt: number
}

const favoritesKey = 'aniphim-favorites'
const watchlistKey = 'aniphim-watchlist'

function createState<T>(key: string) {
  const items = useState<T[]>(key, () => [])

  function load() {
    if (!import.meta.client) return

    try {
      const raw = window.localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : []
      items.value = Array.isArray(parsed) ? parsed : []
    } catch {
      items.value = []
    }
  }

  function persist() {
    if (!import.meta.client) return
    window.localStorage.setItem(key, JSON.stringify(items.value))
  }

  return { items, load, persist }
}

function keyOf(item: Pick<LibraryMovie, 'source' | 'slug'>) {
  return `${item.source}:${item.slug}`
}

export function useLibrary() {
  const favoritesState = createState<LibraryMovie>(favoritesKey)
  const watchlistState = createState<LibraryMovie>(watchlistKey)

  function addUnique(list: LibraryMovie[], movie: Omit<LibraryMovie, 'updatedAt'>) {
    const updated: LibraryMovie = { ...movie, updatedAt: Date.now() }
    return [updated, ...list.filter((item) => keyOf(item) !== keyOf(updated))].slice(0, 60)
  }

  function toggleFavorite(movie: Omit<LibraryMovie, 'updatedAt'>) {
    const exists = favoritesState.items.value.some((item) => keyOf(item) === keyOf(movie))
    favoritesState.items.value = exists
      ? favoritesState.items.value.filter((item) => keyOf(item) !== keyOf(movie))
      : addUnique(favoritesState.items.value, movie)
    favoritesState.persist()
    return !exists
  }

  function toggleWatchlist(movie: Omit<LibraryMovie, 'updatedAt'>) {
    const exists = watchlistState.items.value.some((item) => keyOf(item) === keyOf(movie))
    watchlistState.items.value = exists
      ? watchlistState.items.value.filter((item) => keyOf(item) !== keyOf(movie))
      : addUnique(watchlistState.items.value, movie)
    watchlistState.persist()
    return !exists
  }

  function isFavorite(movie: Pick<LibraryMovie, 'source' | 'slug'>) {
    return favoritesState.items.value.some((item) => keyOf(item) === keyOf(movie))
  }

  function isWatchlist(movie: Pick<LibraryMovie, 'source' | 'slug'>) {
    return watchlistState.items.value.some((item) => keyOf(item) === keyOf(movie))
  }

  onMounted(() => {
    favoritesState.load()
    watchlistState.load()
  })

  return {
    favorites: favoritesState.items,
    watchlist: watchlistState.items,
    toggleFavorite,
    toggleWatchlist,
    isFavorite,
    isWatchlist,
  }
}
