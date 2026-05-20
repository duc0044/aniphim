<script setup lang="ts">
import { ChevronLeft, ChevronRight, Clapperboard, Filter, Search, Sparkles, Volume2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const page = ref(Math.max(Number(route.query.page || 1), 1))
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const debouncedKeyword = ref(keyword.value.trim())
const type = ref(typeof route.query.type === 'string' ? route.query.type : 'all')
const audio = ref(typeof route.query.audio === 'string' ? route.query.audio : 'all')

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(keyword, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedKeyword.value = value.trim()
    page.value = 1
  }, 420)
})

watch(type, () => {
  page.value = 1
})

watch(audio, () => {
  page.value = 1
})

watch([page, debouncedKeyword, type, audio], () => {
  router.replace({
    query: {
      page: page.value > 1 ? page.value : undefined,
      q: debouncedKeyword.value || undefined,
      type: type.value !== 'all' ? type.value : undefined,
      audio: audio.value !== 'all' ? audio.value : undefined,
    },
  })
})

const { data, pending, error } = await useFetch('/api/movies', {
  query: computed(() => ({
    page: page.value,
    keyword: debouncedKeyword.value || undefined,
  })),
})

const movies = computed(() => data.value?.items ?? [])
const activeTypeLabel = computed(() => ({
  all: 'Tat ca',
  series: 'Series',
  movie: 'Movie',
}[type.value] || 'Tat ca'))

const activeAudioLabel = computed(() => ({
  all: 'Tieng Viet',
  sub: 'Vietsub',
  voiceover: 'Thuyet minh',
  dub: 'Long tieng',
}[audio.value] || 'Tieng Viet'))

function getAudioType(lang?: string) {
  const value = String(lang || '').toLowerCase()
  if (!value) return 'unknown'
  if (value.includes('lồng tiếng') || value.includes('long tieng')) return 'dub'
  if (value.includes('thuyết minh') || value.includes('thuyet minh')) return 'voiceover'
  if (value.includes('vietsub') || value.includes('phụ đề việt') || value.includes('phu de viet')) return 'sub'
  return 'other'
}

function getAudioBadge(lang?: string) {
  const langType = getAudioType(lang)
  if (langType === 'sub') return 'Vietsub'
  if (langType === 'voiceover') return 'Thuyet minh'
  if (langType === 'dub') return 'Long tieng'
  return lang || ''
}

const filteredMovies = computed(() => {
  return movies.value.filter((movie: any) => {
    const isSeries = movie.type !== 'movie'
    const isSingle = movie.type === 'movie' || movie.episode === 'Full'
    const langType = getAudioType(movie.lang)

    const matchesType = type.value === 'all'
      || (type.value === 'series' && isSeries)
      || (type.value === 'movie' && isSingle)

    const matchesAudio = audio.value === 'all'
      || (audio.value === 'sub' && langType === 'sub')
      || (audio.value === 'voiceover' && langType === 'voiceover')
      || (audio.value === 'dub' && langType === 'dub')

    return matchesType && matchesAudio
  })
})
const totalPages = computed(() => Number(data.value?.pagination?.totalPages || data.value?.pagination?.total_pages || 0))
const sourceStatus = computed(() => data.value?.sources ?? [])
const sourceReadyCount = computed(() => sourceStatus.value.filter((source: any) => source.ok).length)

function nextPage() {
  page.value += 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function previousPage() {
  page.value = Math.max(1, page.value - 1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

useHead({
  title: 'Kho anime - AniPhim',
  meta: [
    {
      name: 'description',
      content: 'Tìm kiếm và lọc anime, phim hoạt hình Vietsub trên AniPhim.',
    },
  ],
})
</script>

<template>
  <main class="min-h-screen bg-slate-950">
    <AppHeader />

    <section class="relative overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_28%)]" />
      <div class="mx-auto max-w-390 px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pt-24 xl:px-10">
        <div class="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_30px_120px_rgba(2,6,23,0.65)] backdrop-blur-xl sm:p-7 lg:p-8">
          <div class="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_60%)] lg:block" />

          <div class="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:items-end">
            <div>
              <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-orange-200 uppercase">
                <Sparkles class="size-3.5" />
                AniPhim Library
              </div>
              <h1 class="mt-4 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Duyet anime dep va ro hon
              </h1>
              <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Tim nhanh series, movie va cac ban tieng Viet trong kho anime duoc tong hop tu nhieu nguon.
              </p>

              <div class="mt-6 grid gap-3 sm:grid-cols-3">
                <div class="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <div class="flex items-center gap-2 text-orange-400">
                    <Clapperboard class="size-4" />
                    <span class="text-xs font-bold uppercase tracking-[0.18em]">Ket qua</span>
                  </div>
                  <p class="mt-3 text-3xl font-black text-white">{{ filteredMovies.length }}</p>
                  <p class="mt-1 text-xs text-slate-400">anime dang hien tren trang</p>
                </div>

                <div class="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <div class="flex items-center gap-2 text-orange-400">
                    <Filter class="size-4" />
                    <span class="text-xs font-bold uppercase tracking-[0.18em]">Bo loc</span>
                  </div>
                  <p class="mt-3 text-xl font-black text-white">{{ activeTypeLabel }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ activeAudioLabel }}</p>
                </div>

                <div class="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <div class="flex items-center gap-2 text-orange-400">
                    <Volume2 class="size-4" />
                    <span class="text-xs font-bold uppercase tracking-[0.18em]">Nguon</span>
                  </div>
                  <p class="mt-3 text-3xl font-black text-white">{{ sourceReadyCount }}</p>
                  <p class="mt-1 text-xs text-slate-400">nguon san sang / {{ sourceStatus.length || 2 }}</p>
                </div>
              </div>
            </div>

            <div class="relative rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4 sm:p-5">
              <div
                class="flex min-w-0 items-center rounded-[1.2rem] border border-white/10 bg-white/7 px-4 py-3 shadow-2xl shadow-orange-950/10">
                <Search class="mr-3 size-4 shrink-0 text-orange-400" />
                <input v-model="keyword" type="search" placeholder="Tim anime, movie, nhan vat..."
                  class="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500">
              </div>

              <div class="mt-4">
                <p class="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Dang phim</p>
                <div class="grid grid-cols-3 gap-2 rounded-[1.3rem] bg-white/6 p-1.5">
                  <button type="button" class="rounded-xl px-4 py-3 text-sm font-bold transition"
                    :class="type === 'all' ? 'bg-orange-500 text-slate-950 shadow-lg shadow-sky-500/20' : 'text-slate-200 hover:bg-white/8 hover:text-white'"
                    @click="type = 'all'">
                    Tat ca
                  </button>
                  <button type="button" class="rounded-xl px-4 py-3 text-sm font-bold transition"
                    :class="type === 'series' ? 'bg-orange-500 text-slate-950 shadow-lg shadow-sky-500/20' : 'text-slate-200 hover:bg-white/8 hover:text-white'"
                    @click="type = 'series'">
                    Series
                  </button>
                  <button type="button" class="rounded-xl px-4 py-3 text-sm font-bold transition"
                    :class="type === 'single' ? 'bg-orange-500 text-slate-950 shadow-lg shadow-sky-500/20' : 'text-slate-200 hover:bg-white/8 hover:text-white'"
                    @click="type = 'single'">
                    Movie
                  </button>
                </div>
              </div>

              <div class="mt-4">
                <p class="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ngon ngu</p>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button type="button" class="rounded-2xl border px-4 py-3 text-sm font-bold transition"
                    :class="audio === 'all' ? 'border-orange-500/55 bg-orange-500 text-slate-950' : 'border-white/10 bg-white/6 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white'"
                    @click="audio = 'all'">
                    Tieng Viet
                  </button>
                  <button type="button" class="rounded-2xl border px-4 py-3 text-sm font-bold transition"
                    :class="audio === 'sub' ? 'border-orange-500/55 bg-orange-500 text-slate-950' : 'border-white/10 bg-white/6 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white'"
                    @click="audio = 'sub'">
                    Vietsub
                  </button>
                  <button type="button" class="rounded-2xl border px-4 py-3 text-sm font-bold transition"
                    :class="audio === 'voiceover' ? 'border-orange-500/55 bg-orange-500 text-slate-950' : 'border-white/10 bg-white/6 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white'"
                    @click="audio = 'voiceover'">
                    Thuyet minh
                  </button>
                  <button type="button" class="rounded-2xl border px-4 py-3 text-sm font-bold transition"
                    :class="audio === 'dub' ? 'border-orange-500/55 bg-orange-500 text-slate-950' : 'border-white/10 bg-white/6 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white'"
                    @click="audio = 'dub'">
                    Long tieng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="sourceStatus.length" class="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
          <span v-for="source in sourceStatus" :key="source.name"
            class="rounded-full border px-3 py-1.5"
            :class="source.ok ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' : 'border-amber-400/20 bg-amber-400/10 text-amber-100'">
            {{ source.name }}: {{ source.ok ? 'san sang' : 'tam loi' }}
          </span>
        </div>

        <p v-if="error" class="mt-6 rounded-3xl border border-red-300/30 bg-red-500/12 p-4 text-red-100">
          Khong tai duoc du lieu phim. Vui long thu lai sau.
        </p>

        <div v-if="pending" class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="item in 18" :key="item" class="aspect-2/3 animate-pulse rounded-[1.4rem] bg-white/10" />
        </div>

        <div v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <NuxtLink v-for="movie in filteredMovies" :key="`${movie.source}-${movie.slug}`"
            :to="{ path: `/phim/${movie.slug}`, query: { source: movie.source } }"
            class="group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-900 shadow-[0_18px_50px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_28px_80px_rgba(14,165,233,0.18)]">
            <div class="relative aspect-2/3 overflow-hidden">
              <img :src="movie.thumb || movie.poster" :alt="movie.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div class="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                <span class="rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-slate-950">
                  {{ movie.source }}
                </span>
                <span v-if="getAudioBadge(movie.lang)"
                  class="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur">
                  {{ getAudioBadge(movie.lang) }}
                </span>
              </div>
              <div class="absolute inset-x-0 bottom-0 p-3">
                <div class="rounded-[1.1rem] border border-white/10 bg-black/45 p-3 backdrop-blur-md">
                  <p class="line-clamp-2 text-sm font-black leading-snug text-white">{{ movie.name }}</p>
                  <p v-if="movie.originName" class="mt-1 truncate text-[11px] font-semibold text-slate-300">
                    {{ movie.originName }}
                  </p>
                  <div class="mt-3 flex flex-wrap gap-1.5">
                    <span v-if="movie.episode" class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white">
                      {{ movie.episode }}
                    </span>
                    <span v-if="movie.quality" class="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-slate-950">
                      {{ movie.quality }}
                    </span>
                    <span v-if="movie.year" class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white">
                      {{ movie.year }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div v-if="!pending && !filteredMovies.length"
          class="mt-8 rounded-[1.6rem] border border-white/10 bg-white/6 p-10 text-center text-slate-300">
          Khong co phim phu hop voi bo loc hien tai.
        </div>

        <div v-if="movies.length" class="flex items-center justify-center gap-3 pt-10">
          <button type="button" :disabled="page === 1"
            class="grid size-12 place-items-center rounded-full border border-white/15 bg-white/8 text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang truoc" @click="previousPage">
            <ChevronLeft class="size-5" />
          </button>
          <span class="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
            Trang {{ page }}<template v-if="totalPages"> / {{ totalPages }}</template>
          </span>
          <button type="button"
            class="grid size-12 place-items-center rounded-full bg-orange-500 text-slate-950 transition hover:bg-white"
            aria-label="Trang sau" @click="nextPage">
            <ChevronRight class="size-5" />
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
