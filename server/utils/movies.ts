type Source = 'ophim' | 'nguonc'

export interface NormalizedMovie {
  id: string
  source: Source
  name: string
  originName: string
  slug: string
  thumb: string
  poster: string
  year?: number
  time?: string
  episode?: string
  quality?: string
  lang?: string
  type?: string
  rating?: number
  categories: string[]
  countries: string[]
}

export interface NormalizedEpisode {
  name: string
  slug?: string
  linkEmbed?: string
  linkM3u8?: string
}

export interface NormalizedServer {
  name: string
  episodes: NormalizedEpisode[]
}

export interface NormalizedActor {
  name: string
  originalName?: string
  role?: string
  avatar?: string
}

export interface MovieDetail extends NormalizedMovie {
  content: string
  actors: NormalizedActor[]
  directors: string[]
  trailer?: string
  servers: NormalizedServer[]
}

const OPHIM_BASE = 'https://ophim1.com'
const OPHIM_IMAGE = 'https://img.ophim.live/uploads/movies/'
const NGUONC_BASE = 'https://phim.nguonc.com'

function toArray<T>(value: T[] | T | undefined | null): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function joinImage(base: string, path?: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${cleanBase}${cleanPath}`
}

function joinOphimImage(base: string, path?: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const url = new URL(base)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const basePath = url.pathname.replace(/\/$/, '')

  if (cleanPath.startsWith('uploads/')) {
    url.pathname = cleanPath
  } else if (basePath.includes('/uploads/movies')) {
    url.pathname = `${basePath}/${cleanPath}`
  } else {
    url.pathname = `/uploads/movies/${cleanPath}`
  }

  return url.toString()
}

function includesAnimation(movie: any) {
  if (movie?.type === 'hoathinh') return true
  const categories = toArray(movie?.category ?? movie?.categories ?? movie?.the_loai)
  if (!categories.length) return false

  return categories.some((category: any) => {
    const slug = text(category?.slug ?? category).toLowerCase()
    const name = text(category?.name ?? category).toLowerCase()
    return slug === 'hoat-hinh' || name.includes('hoạt hình') || name.includes('hoat hinh') || name.includes('anime')
  })
}

function stripHtml(value?: string) {
  return text(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeActor(actor: any): NormalizedActor | undefined {
  if (typeof actor === 'string') {
    const name = actor.trim()
    return name ? { name } : undefined
  }

  const name = text(actor?.name || actor?.actor_name || actor?.title).trim()
  if (!name) return undefined

  return {
    name,
    originalName: text(actor?.original_name || actor?.origin_name || actor?.real_name) || undefined,
    role: text(actor?.role || actor?.character || actor?.as || actor?.cast_name) || undefined,
    avatar: joinImage('', actor?.avatar || actor?.image || actor?.thumb_url || actor?.poster_url) || undefined,
  }
}

export function normalizeOphimMovie(movie: any, pathImage = OPHIM_IMAGE): NormalizedMovie {
  return {
    id: `ophim:${movie?._id ?? movie?.slug}`,
    source: 'ophim',
    name: text(movie?.name, 'Chưa có tên'),
    originName: text(movie?.origin_name),
    slug: text(movie?.slug),
    thumb: joinOphimImage(pathImage, movie?.thumb_url),
    poster: joinOphimImage(pathImage, movie?.poster_url || movie?.thumb_url),
    year: Number(movie?.year) || undefined,
    time: text(movie?.time),
    episode: text(movie?.episode_current),
    quality: text(movie?.quality),
    lang: text(movie?.lang),
    type: text(movie?.type),
    rating: Number(movie?.tmdb?.vote_average || movie?.imdb?.vote_average) || undefined,
    categories: toArray(movie?.category).map((item: any) => text(item?.name)).filter(Boolean),
    countries: toArray(movie?.country).map((item: any) => text(item?.name)).filter(Boolean),
  }
}

function normalizeNguoncMovie(movie: any): NormalizedMovie {
  const image = movie?.thumb_url || movie?.poster_url || movie?.image || movie?.thumbnail

  return {
    id: `nguonc:${movie?._id ?? movie?.slug}`,
    source: 'nguonc',
    name: text(movie?.name || movie?.title, 'Chưa có tên'),
    originName: text(movie?.original_name || movie?.origin_name),
    slug: text(movie?.slug),
    thumb: joinImage('', image),
    poster: joinImage('', movie?.poster_url || image),
    year: Number(movie?.year || movie?.release_year) || undefined,
    time: text(movie?.time || movie?.duration),
    episode: text(movie?.episode_current || movie?.current_episode),
    quality: text(movie?.quality),
    lang: text(movie?.language || movie?.lang),
    type: text(movie?.type),
    rating: Number(movie?.rating) || undefined,
    categories: toArray(movie?.category || movie?.categories).map((item: any) => text(item?.name ?? item)).filter(Boolean),
    countries: toArray(movie?.country || movie?.countries).map((item: any) => text(item?.name ?? item)).filter(Boolean),
  }
}

async function requestJson<T>(url: string): Promise<T> {
  return await $fetch<T>(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'KR-Phim/1.0',
    },
    retry: 0,
    timeout: 12000,
  })
}

export async function getOphimAnimatedMovies(page: number, keyword = '') {
  const url = keyword
    ? new URL('/v1/api/tim-kiem', OPHIM_BASE)
    : new URL('/v1/api/danh-sach/hoat-hinh', OPHIM_BASE)

  url.searchParams.set('page', String(page))
  if (keyword) {
    url.searchParams.set('keyword', keyword)
  }

  const json: any = await requestJson(url.toString())
  const data = json?.data ?? json
  const imageBase = data?.APP_DOMAIN_CDN_IMAGE || data?.pathImage || OPHIM_IMAGE
  const rawItems = toArray(data?.items ?? json?.items)
  const items = (keyword ? rawItems.filter(includesAnimation) : rawItems)
    .map((item) => normalizeOphimMovie(item, imageBase))
    .filter((movie) => movie.slug)

  return {
    items,
    pagination: data?.params?.pagination ?? data?.pagination ?? json?.pagination ?? {},
  }
}

export async function getNguoncAnimatedMovies(page: number, keyword = '') {
  const url = keyword
    ? new URL('/api/films/search', NGUONC_BASE)
    : new URL('/api/films/the-loai/hoat-hinh', NGUONC_BASE)

  if (keyword) {
    url.searchParams.set('keyword', keyword)
  } else {
    url.searchParams.set('page', String(page))
  }

  const json: any = await requestJson(url.toString())
  const data = json?.data ?? json
  const rawItems = toArray(data?.items ?? data?.films ?? json?.items)
  const items = (keyword ? rawItems.filter(includesAnimation) : rawItems)
    .map(normalizeNguoncMovie)
    .filter((movie) => movie.slug)

  return {
    items,
    pagination: data?.pagination ?? json?.pagination ?? {},
  }
}

export async function getAnimatedMovies(page: number, keyword = '') {
  const results = await Promise.allSettled([
    getOphimAnimatedMovies(page, keyword),
    getNguoncAnimatedMovies(page, keyword),
  ])

  const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value.items : [])
  const seen = new Set<string>()
  const unique = items.filter((movie) => {
    const key = movie.slug || `${movie.source}:${movie.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const pagination = results.find((result) => result.status === 'fulfilled')?.value.pagination ?? {}

  return {
    items: unique,
    page,
    pagination,
    sources: results.map((result, index) => ({
      name: index === 0 ? 'ophim' : 'nguonc',
      ok: result.status === 'fulfilled',
    })),
  }
}

export async function getOphimDetail(slug: string): Promise<MovieDetail> {
  const json: any = await requestJson(`${OPHIM_BASE}/v1/api/phim/${slug}`)
  const data = json?.data ?? json
  const movie = data?.item ?? data?.movie ?? json?.movie ?? json?.item
  const imageBase = data?.APP_DOMAIN_CDN_IMAGE || data?.pathImage || OPHIM_IMAGE
  const normalized = normalizeOphimMovie(movie, imageBase)

  return {
    ...normalized,
    content: stripHtml(movie?.content),
    actors: toArray(movie?.actor).map(normalizeActor).filter(Boolean) as NormalizedActor[],
    directors: toArray(movie?.director).map((item) => text(item)).filter(Boolean),
    trailer: text(movie?.trailer_url),
    servers: toArray(data?.episodes ?? json?.episodes ?? movie?.episodes).map((server: any) => ({
      name: text(server?.server_name, 'Server'),
      episodes: toArray(server?.server_data).map((episode: any) => ({
        name: text(episode?.name, 'Tập phim'),
        slug: text(episode?.slug),
        linkEmbed: text(episode?.link_embed),
        linkM3u8: text(episode?.link_m3u8),
      })),
    })),
  }
}

export async function getNguoncDetail(slug: string): Promise<MovieDetail> {
  const json: any = await requestJson(`${NGUONC_BASE}/api/film/${slug}`)
  const movie = json?.movie ?? json?.item ?? json?.data?.item ?? json?.data?.movie ?? json
  const normalized = normalizeNguoncMovie(movie)

  return {
    ...normalized,
    content: stripHtml(movie?.content || movie?.description),
    actors: toArray(movie?.actor || movie?.actors).map(normalizeActor).filter(Boolean) as NormalizedActor[],
    directors: toArray(movie?.director || movie?.directors).map((item: any) => text(item?.name ?? item)).filter(Boolean),
    trailer: text(movie?.trailer_url || movie?.trailer),
    servers: toArray(movie?.episodes ?? json?.episodes ?? json?.data?.episodes).map((server: any) => ({
      name: text(server?.server_name || server?.name, 'Server'),
      episodes: toArray(server?.server_data ?? server?.items ?? server?.episodes).map((episode: any) => ({
        name: text(episode?.name || episode?.title, 'Tập phim'),
        slug: text(episode?.slug),
        linkEmbed: text(episode?.link_embed || episode?.embed),
        linkM3u8: text(episode?.link_m3u8 || episode?.m3u8),
      })),
    })),
  }
}

export async function getOphimMoviesByGenre(genre: string, page: number) {
  const url = new URL(`/v1/api/the-loai/${genre}`, OPHIM_BASE)
  url.searchParams.set('page', String(page))

  const json: any = await requestJson(url.toString())
  const data = json?.data ?? json
  const imageBase = data?.APP_DOMAIN_CDN_IMAGE || data?.pathImage || OPHIM_IMAGE
  const rawItems = toArray(data?.items ?? json?.items)
  const items = rawItems
    .filter(includesAnimation)
    .map((item) => normalizeOphimMovie(item, imageBase))
    .filter((movie) => movie.slug)

  return {
    items,
    pagination: data?.params?.pagination ?? data?.pagination ?? json?.pagination ?? {},
  }
}

export async function getNguoncMoviesByGenre(genre: string, page: number) {
  const url = new URL(`/api/films/the-loai/${genre}`, NGUONC_BASE)
  url.searchParams.set('page', String(page))

  const json: any = await requestJson(url.toString())
  const data = json?.data ?? json
  const rawItems = toArray(data?.items ?? data?.films ?? json?.items)
  const items = rawItems
    .filter(includesAnimation)
    .map(normalizeNguoncMovie)
    .filter((movie) => movie.slug)

  return {
    items,
    pagination: data?.pagination ?? json?.pagination ?? {},
  }
}

export async function getMoviesByGenre(genre: string, page: number) {
  const results = await Promise.allSettled([
    getOphimMoviesByGenre(genre, page),
    getNguoncMoviesByGenre(genre, page),
  ])

  const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value.items : [])
  const seen = new Set<string>()
  const unique = items.filter((movie) => {
    const key = movie.slug || `${movie.source}:${movie.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const pagination = results.find((result) => result.status === 'fulfilled')?.value.pagination ?? {}

  return {
    items: unique,
    page,
    pagination,
    sources: results.map((result, index) => ({
      name: index === 0 ? 'ophim' : 'nguonc',
      ok: result.status === 'fulfilled',
    })),
  }
}
