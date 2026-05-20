<script setup lang="ts">
import { Calendar, Clock, Sparkles } from 'lucide-vue-next'

const { data, pending, error } = await useFetch('/api/movies', {
  query: {
    page: 1,
  },
})

const movies = computed(() => data.value?.items ?? [])

const days = [
  { label: 'Thứ Hai', value: 1 },
  { label: 'Thứ Ba', value: 2 },
  { label: 'Thứ Tư', value: 3 },
  { label: 'Thứ Năm', value: 4 },
  { label: 'Thứ Sáu', value: 5 },
  { label: 'Thứ Bảy', value: 6 },
  { label: 'Chủ Nhật', value: 0 },
]

// Get current day of week (0 = Sunday, 1 = Monday...)
const currentDay = ref(new Date().getDay())

// Hash function to consistently assign a movie to a release day of the week
function getReleaseDay(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 7
}

const schedule = computed(() => {
  const grouped: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  movies.value.forEach((movie) => {
    const day = getReleaseDay(movie.name)
    grouped[day].push(movie)
  })
  return grouped
})

const activeMovies = computed(() => schedule.value[currentDay.value] ?? [])

useHead({
  title: 'Lịch Chiếu Hoạt Hình - AniPhim',
  meta: [
    {
      name: 'description',
      content: 'Lịch chiếu phim hoạt hình Trung Quốc, Anime Nhật Bản mới nhất trong tuần.',
    },
  ],
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 pb-16">
    <AppHeader />

    <section class="relative overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_30%)]" />
      <div class="mx-auto max-w-390 px-4 pt-32 sm:px-6 lg:px-8 lg:pt-24 xl:px-10">
        
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-orange-200 uppercase">
            <Calendar class="size-3.5" />
            Lịch phát sóng
          </div>
          <h1 class="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Lịch Chiếu Phim
          </h1>
          <p class="mt-2 text-sm text-slate-400">
            Theo dõi thời gian ra mắt các tập phim mới nhất của các bộ hoạt hình yêu thích.
          </p>
        </div>

        <!-- Days Navigation Tab -->
        <div class="mb-10 flex flex-wrap gap-2 rounded-[1.5rem] bg-white/5 p-2 backdrop-blur">
          <button v-for="day in days" :key="day.value" type="button"
            class="flex-1 min-w-[80px] rounded-xl py-3 text-center text-sm font-bold transition"
            :class="currentDay === day.value 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
              : 'text-slate-300 hover:bg-white/8 hover:text-white'"
            @click="currentDay = day.value">
            {{ day.label }}
          </button>
        </div>

        <p v-if="error" class="rounded-3xl border border-red-300/30 bg-red-500/12 p-4 text-red-100">
          Không tải được dữ liệu lịch chiếu. Vui lòng thử lại sau.
        </p>

        <div v-if="pending" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="item in 6" :key="item" class="aspect-2/3 animate-pulse rounded-[1.4rem] bg-white/10" />
        </div>

        <div v-else-if="activeMovies.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <NuxtLink v-for="movie in activeMovies" :key="`${movie.source}-${movie.slug}`"
            :to="{ path: `/phim/${movie.slug}`, query: { source: movie.source } }"
            class="group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-900 shadow-[0_18px_50px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_28px_80px_rgba(249,115,22,0.15)]">
            <div class="relative aspect-2/3 overflow-hidden">
              <img :src="movie.thumb || movie.poster" :alt="movie.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <!-- Tag Lịch Chiếu/Giờ Chiếu MOCK -->
              <div class="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                <span class="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-white">
                  <Clock class="size-3" />
                  {{ 10 + (getReleaseDay(movie.name) * 2) }}:00
                </span>
                <span v-if="movie.episode"
                  class="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur">
                  {{ movie.episode }}
                </span>
              </div>

              <div class="absolute inset-x-0 bottom-0 p-3">
                <div class="rounded-[1.1rem] border border-white/10 bg-black/45 p-3 backdrop-blur-md">
                  <p class="line-clamp-2 text-sm font-black leading-snug text-white">{{ movie.name }}</p>
                  <p v-if="movie.originName" class="mt-1 truncate text-[11px] font-semibold text-slate-300">
                    {{ movie.originName }}
                  </p>
                  <div class="mt-3 flex flex-wrap gap-1.5">
                    <span v-if="movie.quality" class="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-white">
                      {{ movie.quality }}
                    </span>
                    <span v-if="movie.lang" class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white">
                      {{ movie.lang }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="rounded-[1.6rem] border border-white/10 bg-white/6 p-10 text-center text-slate-300">
          Chưa xếp lịch hoặc hôm nay không có phim nào phát sóng.
        </div>

      </div>
    </section>
  </main>
</template>
