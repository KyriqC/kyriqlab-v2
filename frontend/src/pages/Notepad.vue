<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold">Notepad</h1>
        <p class="opacity-80 mt-1 text-sm">Thoughts, projects, and updates</p>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="mt-6 flex flex-col sm:flex-row gap-3">
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search posts..."
          class="w-full px-4 py-2.5 pl-10 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-white/25 transition"
          @input="debouncedSearch"
        />
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div class="flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="px-4 py-2 rounded-xl border transition text-sm"
          :class="activeFilter === filter.value
            ? 'border-[#00A651]/50 bg-[#00A651]/10 text-[#00A651]'
            : 'border-white/10 bg-white/5 hover:border-white/20'"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mt-6 k-card p-4">
      <div class="font-semibold">Error</div>
      <div class="opacity-80 text-sm mt-1">{{ error }}</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mt-8 text-center opacity-70">
      Loading posts...
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="mt-8 k-card p-8 text-center">
      <p class="opacity-70">
        {{ searchQuery ? 'No posts found matching your search.' : 'No posts yet. Check back soon!' }}
      </p>
      <button
        v-if="searchQuery || activeFilter !== 'all'"
        class="mt-4 k-btn2"
        @click="clearFilters"
      >
        Clear filters
      </button>
    </div>

    <!-- Posts Grid -->
    <div v-else class="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RouterLink
        v-for="p in items"
        :key="p._id"
        class="k-card overflow-hidden block hover:translate-y-[-2px] transition group"
        :to="`/posts/${p.slug}`"
      >
        <!-- Featured Image -->
        <div class="h-44 bg-white/5 overflow-hidden">
          <img
            v-if="p.featuredImageUrl"
            :src="p.featuredImageUrl"
            :alt="p.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-4xl opacity-20"
          >
            📝
          </div>
        </div>

        <div class="p-5">
          <div class="flex items-center gap-2 text-xs">
            <span class="opacity-70">
              {{ formatDate(p.publishedAt || p.createdAt) }}
            </span>
            <span
              v-if="p.featured"
              class="px-2 py-0.5 rounded border border-[#00A651]/30 text-[#00A651] bg-[#00A651]/10"
            >
              Featured
            </span>
          </div>

          <h2 class="text-lg font-semibold mt-2 group-hover:text-[#00A651] transition">
            {{ p.title }}
          </h2>

          <p class="opacity-70 text-sm mt-2 line-clamp-2">
            {{ p.summary || '' }}
          </p>
        </div>
      </RouterLink>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-10 flex justify-center items-center gap-2">
      <button
        class="k-btn2"
        :disabled="currentPage <= 1"
        @click="loadPage(currentPage - 1)"
      >
        ← Prev
      </button>

      <div class="flex gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="w-10 h-10 rounded-lg border transition text-sm"
          :class="page === currentPage
            ? 'border-[#00A651]/50 bg-[#00A651]/10 text-[#00A651]'
            : 'border-white/10 hover:border-white/20'"
          @click="loadPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="k-btn2"
        :disabled="currentPage >= totalPages"
        @click="loadPage(currentPage + 1)"
      >
        Next →
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'

const items = ref([])
const error = ref('')
const loading = ref(true)

const currentPage = ref(1)
const totalPages = ref(1)
const limit = 12

const searchQuery = ref('')
const activeFilter = ref('all')

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Featured', value: 'featured' },
]

// Debounce timer
let searchTimeout = null

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Visible page numbers for pagination
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

async function loadPage(page) {
  loading.value = true
  error.value = ''

  try {
    const params = {
      page,
      limit,
      status: 'published',
    }

    // Add search query
    if (searchQuery.value.trim()) {
      params.q = searchQuery.value.trim()
    }

    // Add featured filter
    if (activeFilter.value === 'featured') {
      params.featured = 'true'
    }

    const { data } = await api.get('/posts', { params })
    items.value = data.items || []
    currentPage.value = data.page || 1
    totalPages.value = data.pages || 1
  } catch (e) {
    error.value = e?.message || 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadPage(1)
  }, 300)
}

function setFilter(filter) {
  activeFilter.value = filter
  loadPage(1)
}

function clearFilters() {
  searchQuery.value = ''
  activeFilter.value = 'all'
  loadPage(1)
}

onMounted(() => loadPage(1))
</script>
