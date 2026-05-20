<script setup lang="ts">
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug || ''))
const page = ref(Math.max(Number(route.query.page || 1), 1))

// Map slug to human readable title
const genreTitles: Record<string, string> = {
  'tu-tien': 'Tu Tiên',
  'kiem-hiep': 'Kiếm Hiệp',
  'co-trang': 'Cổ Trang',
  'huyen-huyen': 'Huyền Huyễn',
  'khoa-huyen': 'Khoa Huyễn',
  'hoat-hinh-3d': 'Hoạt Hình 3D',
  'hoat-hinh': 'Hoạt Hình',
}

const genreTitle = computed(() => genreTitles[slug.value] || 'Thể Loại')

const { data, pending, error } = await useFetch('/api/genres', {
  query: computed(() => ({
    slug: slug.value,
    page: page.value,
  })),
  watch: [slug, page],
})

const movies = computed(() => data.value?.items ?? [])
const totalPages = computed(() => Number(data.value?.pagination?.totalPages || data.value?.pagination?.total_pages || 0))

function nextPage() {
  page.value += 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function previousPage() {
  page.value = Math.max(1, page.value - 1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(page, () => {
  router.replace({
    query: {
      page: page.value > 1 ? page.value : undefined,
    },
  })
})

useHead({
  title: computed(() => `Phim Hoạt Hình ${genreTitle.value} - AniPhim`),
  meta: [
    {
      name: 'description',
      content: computed(() => `Xem phim hoạt hình ${genreTitle.value} hay nhất chất lượng cao.`),
    },
  ],
})
</script>

<template>
  <main class="min-h-screen bg-slate-950">
    <AppHeader />

    <section class="relative overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_30%)]" />
      <div class="mx-auto max-w-390 px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pt-24 xl:px-10">
        
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-orange-200 uppercase">
            <Sparkles class="size-3.5" />
            Thể Loại Phim
          </div>
          <h1 class="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            {{ genreTitle }}
          </h1>
          <p class="mt-2 text-sm text-slate-400">
            Tổng hợp danh sách phim hoạt hình thể loại {{ genreTitle }} hay nhất cập nhật mới nhất.
          </p>
        </div>

        <p v-if="error" class="rounded-3xl border border-red-300/30 bg-red-500/12 p-4 text-red-100">
          Không tải được dữ liệu phim. Vui lòng thử lại sau.
        </p>

        <div v-if="pending" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="item in 12" :key="item" class="aspect-2/3 animate-pulse rounded-[1.4rem] bg-white/10" />
        </div>

        <div v-else-if="movies.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <NuxtLink v-for="movie in movies" :key="`${movie.source}-${movie.slug}`"
            :to="{ path: `/phim/${movie.slug}`, query: { source: movie.source } }"
            class="group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-900 shadow-[0_18px_50px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_28px_80px_rgba(249,115,22,0.15)]">
            <div class="relative aspect-2/3 overflow-hidden">
              <img :src="movie.thumb || movie.poster" :alt="movie.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div class="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                <span class="rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-white">
                  {{ movie.source }}
                </span>
                <span v-if="movie.lang"
                  class="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur">
                  {{ movie.lang }}
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
                    <span v-if="movie.quality" class="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-white">
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

        <div v-else class="rounded-[1.6rem] border border-white/10 bg-white/6 p-10 text-center text-slate-300">
          Không có phim nào thuộc thể loại này.
        </div>

        <div v-if="movies.length" class="flex items-center justify-center gap-3 pt-10">
          <button type="button" :disabled="page === 1"
            class="grid size-12 place-items-center rounded-full border border-white/15 bg-white/8 text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang trước" @click="previousPage">
            <ChevronLeft class="size-5" />
          </button>
          <span class="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
            Trang {{ page }}<template v-if="totalPages"> / {{ totalPages }}</template>
          </span>
          <button type="button"
            class="grid size-12 place-items-center rounded-full bg-orange-500 text-white transition hover:bg-orange-400"
            aria-label="Trang sau" @click="nextPage">
            <ChevronRight class="size-5" />
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
