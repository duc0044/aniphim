<script setup lang="ts">
import { ChevronDown, Grid2x2, Menu, Search, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const mobileMenuOpen = ref(false)
const mobileGenresOpen = ref(false)
const desktopGenresOpen = ref(false)

const navItems = [
  { label: 'Trang Chủ', to: '/' },
  { label: 'Thư Viện', to: '/thu-vien' },
  { label: 'Lịch Chiếu', to: '/lich-chieu' },
]
const genreItems = [
  { label: 'Tu Tiên', to: '/the-loai/tu-tien' },
  { label: 'Kiếm Hiệp', to: '/the-loai/kiem-hiep' },
  { label: 'Cổ Trang', to: '/the-loai/co-trang' },
  { label: 'Huyền Huyễn', to: '/the-loai/huyen-huyen' },
  { label: 'Khoa Huyễn', to: '/the-loai/khoa-huyen' },
  { label: 'Kỳ Ảo', to: '/the-loai/ky-ao' },
  { label: 'Huyền Nghi', to: '/the-loai/huyen-nghi' },
  { label: 'Cảnh Kỳ', to: '/the-loai/canh-ky' },
  { label: 'Dã Sử', to: '/the-loai/da-su' },
  { label: 'Đô Thị', to: '/the-loai/do-thi' },
  { label: 'Đồng Nhân', to: '/the-loai/dong-nhan' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.fullPath === to || route.path === to.split('?')[0] && route.fullPath.includes(to.split('?')[1] || '')
}

function submitSearch() {
  const q = keyword.value.trim()
  router.push({
    path: '/phim',
    query: q ? { q } : undefined,
  })
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  mobileGenresOpen.value = false
}

function closeDesktopGenres() {
  desktopGenresOpen.value = false
}

watch(() => route.path, () => {
  closeMobileMenu()
  closeDesktopGenres()
})
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/78 backdrop-blur-xl">
    <nav class="mx-auto flex max-w-390 items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8 xl:px-10">
      <AppLogo />

      <div class="hidden lg:flex lg:items-center lg:gap-7 lg:text-sm lg:font-semibold lg:text-slate-200">
        <div class="group relative" @mouseenter="desktopGenresOpen = true" @mouseleave="desktopGenresOpen = false">
          <button type="button"
            class="inline-flex items-center gap-1.5 rounded-t-md px-2 py-2 transition hover:text-orange-400"
            :class="route.path.startsWith('/the-loai/') ? 'text-orange-400' : 'text-slate-200'">
            <!-- <Grid2x2 class="size-3.5" /> -->
            <span>Thể Loại</span>
            <ChevronDown class="size-3.5 transition" :class="desktopGenresOpen ? 'rotate-180' : ''" />
          </button>
          <div
            class="absolute left-0 top-full z-40 w-52 overflow-hidden rounded-b-md border border-white/10 bg-[#224566] shadow-2xl transition"
            :class="desktopGenresOpen ? 'visible opacity-100' : 'invisible opacity-0'">
            <NuxtLink v-for="genre in genreItems" :key="genre.to" :to="genre.to"
              class="block px-4 py-2.5 text-base font-semibold text-slate-100 transition hover:bg-[#3d7eb7]"
              :class="isActive(genre.to) ? 'bg-[#3d7eb7]' : ''">
              {{ genre.label }}
            </NuxtLink>
          </div>
        </div>

        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="shrink-0 transition hover:text-orange-400"
          :class="isActive(item.to) ? 'text-orange-400' : 'text-slate-200'">
          {{ item.label }}
        </NuxtLink>
      </div>

      <form
        class="ml-auto flex w-full max-w-xs items-center rounded-full border border-white/10 bg-white/8 px-4 py-2 shadow-2xl shadow-orange-900/20 sm:max-w-sm"
        @submit.prevent="submitSearch">
        <Search class="mr-3 size-4 shrink-0 text-orange-400" />
        <input v-model="keyword" type="search" placeholder="Tìm anime, hoạt hình..."
          class="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400">
      </form>

      <button type="button"
        class="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/8 text-white transition hover:bg-white/16 lg:hidden"
        aria-label="Mở menu" @click="mobileMenuOpen = true">
        <Menu class="size-5" />
      </button>
    </nav>

    <Teleport to="body">
      <Transition name="sidebar">
        <div v-if="mobileMenuOpen" class="fixed inset-0 z-60 lg:hidden">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeMobileMenu" />
          <div class="absolute inset-y-0 left-0 w-72 bg-slate-950 shadow-2xl">
            <div class="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <AppLogo />
              <button type="button"
                class="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/8 text-white transition hover:bg-white/16"
                aria-label="Đóng menu" @click="closeMobileMenu">
                <X class="size-5" />
              </button>
            </div>
            <nav class="flex flex-col gap-1 p-4">
              <button type="button"
                class="flex items-center justify-between rounded-lg px-4 py-3 text-left text-base font-semibold text-slate-200 transition hover:bg-white/8 hover:text-orange-400"
                :class="route.path.startsWith('/the-loai/') ? 'bg-white/8 text-orange-400' : ''"
                @click="mobileGenresOpen = !mobileGenresOpen">
                <span class="inline-flex items-center gap-2">
                  <Grid2x2 class="size-4" />
                  Thể Loại
                </span>
                <ChevronDown class="size-4 transition" :class="mobileGenresOpen ? 'rotate-180' : ''" />
              </button>
              <div v-if="mobileGenresOpen" class="ml-2 flex flex-col gap-1 border-l border-white/10 pl-2">
                <NuxtLink v-for="genre in genreItems" :key="genre.to" :to="genre.to"
                  class="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/8 hover:text-orange-400"
                  :class="isActive(genre.to) ? 'bg-white/8 text-orange-400' : ''" @click="closeMobileMenu">
                  {{ genre.label }}
                </NuxtLink>
              </div>

              <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
                class="rounded-lg px-4 py-3 text-base font-semibold text-slate-200 transition hover:bg-white/8 hover:text-orange-400"
                :class="isActive(item.to) ? 'bg-white/8 text-orange-400' : ''" @click="closeMobileMenu">
                {{ item.label }}
              </NuxtLink>
            </nav>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity 0.2s ease;
}

.sidebar-enter-active>div:last-child,
.sidebar-leave-active>div:last-child {
  transition: transform 0.2s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}

.sidebar-enter-from>div:last-child,
.sidebar-leave-to>div:last-child {
  transform: translateX(-100%);
}
</style>
