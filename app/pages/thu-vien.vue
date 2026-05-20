<script setup lang="ts">
const { favorites, watchlist } = useLibrary()

const watchHistoryKey = 'aniphim-watch-history'
const watchHistory = ref<any[]>([])

function loadWatchHistory() {
  if (!import.meta.client) return

  try {
    const raw = window.localStorage.getItem(watchHistoryKey)
    const history = raw ? JSON.parse(raw) : []
    watchHistory.value = Array.isArray(history) ? history.slice(0, 24) : []
  } catch {
    watchHistory.value = []
  }
}

function historyLink(item: any) {
  return {
    path: `/xem/${item.slug}`,
    query: {
      source: item.source,
      server: item.serverIndex || 0,
      ep: (item.episodeIndex || 0) + 1,
    },
  }
}

onMounted(() => {
  loadWatchHistory()
  window.addEventListener('storage', loadWatchHistory)
})

onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('storage', loadWatchHistory)
})

useHead({
  title: 'Thư viện của bạn - AniPhim',
  meta: [
    {
      name: 'description',
      content: 'Quản lý phim yêu thích, xem sau và lịch sử xem trên AniPhim.',
    },
  ],
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 pb-16">
    <AppHeader />

    <section class="mx-auto max-w-390 px-4 pt-32 sm:px-6 lg:px-8 lg:pt-24 xl:px-10">
      <h1 class="text-4xl font-black text-white sm:text-5xl">Thư viện</h1>
      <p class="mt-2 text-sm text-slate-400">Lưu phim để xem lại nhanh hơn.</p>

      <div class="mt-8">
        <h2 class="text-xl font-black text-white">Yêu thích</h2>
        <div v-if="favorites.length" class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <NuxtLink v-for="movie in favorites" :key="`${movie.source}-${movie.slug}`"
            :to="{ path: `/phim/${movie.slug}`, query: { source: movie.source } }"
            class="group overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            <img :src="movie.thumb || movie.poster" :alt="movie.name" class="aspect-2/3 w-full object-cover">
          </NuxtLink>
        </div>
        <p v-else class="mt-3 text-sm text-slate-400">Chưa có phim yêu thích.</p>
      </div>

      <div class="mt-10">
        <h2 class="text-xl font-black text-white">Xem sau</h2>
        <div v-if="watchlist.length" class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <NuxtLink v-for="movie in watchlist" :key="`${movie.source}-${movie.slug}`"
            :to="{ path: `/phim/${movie.slug}`, query: { source: movie.source } }"
            class="group overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            <img :src="movie.thumb || movie.poster" :alt="movie.name" class="aspect-2/3 w-full object-cover">
          </NuxtLink>
        </div>
        <p v-else class="mt-3 text-sm text-slate-400">Chưa có phim trong danh sách xem sau.</p>
      </div>

      <div class="mt-10">
        <h2 class="text-xl font-black text-white">Xem tiếp</h2>
        <div v-if="watchHistory.length" class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <NuxtLink v-for="item in watchHistory" :key="`${item.source}-${item.slug}-${item.updatedAt}`" :to="historyLink(item)"
            class="group overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            <img :src="item.thumb || item.poster" :alt="item.name" class="aspect-2/3 w-full object-cover">
          </NuxtLink>
        </div>
        <p v-else class="mt-3 text-sm text-slate-400">Bạn chưa xem phim nào gần đây.</p>
      </div>
    </section>
  </main>
</template>
