<template>
  <div class="k-card p-5 h-full flex flex-col overflow-hidden">
    <div class="flex items-center justify-between mb-4 shrink-0">
      <div class="font-semibold">Songs ({{ songs.length }})</div>
    </div>

    <input
      v-model="search"
      type="text"
      placeholder="Filter by title or artist..."
      class="k-inp mb-4 shrink-0"
    />

    <div class="flex-1 overflow-y-auto min-h-0 space-y-2 pr-2">
      <button
        v-for="s in filteredSongs"
        :key="s._id"
        class="w-full text-left rounded-xl border border-white/10 hover:border-white/25 bg-white/5 px-3 py-3 transition group"
        :class="selectedId === s._id ? 'ring-2 ring-[#00A651]/60 bg-white/10' : ''"
        @click="$emit('select', s)"
      >
        <div class="flex justify-between items-start">
          <div class="font-medium truncate pr-2">{{ s.title }}</div>
          <div v-if="s.lyrics" title="Has Lyrics" class="text-xs">📝</div>
          <div v-else title="No Lyrics" class="text-xs opacity-20 group-hover:opacity-100 transition">🚫</div>
        </div>
        <div class="text-xs opacity-60 truncate">{{ s.artist }}</div>
      </button>

      <div v-if="filteredSongs.length === 0" class="text-center py-4 opacity-50">
        No songs found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  songs: { type: Array, default: () => [] },
  selectedId: { type: String, default: null }
})

defineEmits(['select'])

const search = ref('')

const filteredSongs = computed(() => {
  if (!search.value.trim()) return props.songs
  const q = search.value.toLowerCase()
  return props.songs.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  )
})
</script>
