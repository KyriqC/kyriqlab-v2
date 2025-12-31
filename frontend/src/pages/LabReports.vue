<template>
  <div class="min-h-screen py-20 px-4">
    <div class="max-w-6xl mx-auto">
      
      <div class="text-center mb-12">
        <h1 class="text-5xl font-black mb-4">Lab Reports</h1>
        <p class="text-xl opacity-60 max-w-2xl mx-auto">
          Formal technical documentation, architecture diagrams, and security audits from the KyriqLab environment.
        </p>
      </div>

      <div class="max-w-md mx-auto mb-16 relative">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search reports..."
          class="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#00A651] outline-none transition"
        />
        <div class="absolute right-4 top-3.5 opacity-50">🔍</div>
      </div>

      <div v-if="loading" class="text-center opacity-50 animate-pulse py-20">
        Accessing Archives...
      </div>

      <div v-else-if="filteredReports.length === 0" class="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
        <div class="text-6xl mb-4">🔒</div>
        <h2 class="text-2xl font-bold mb-2">
          {{ reports.length === 0 ? 'Classified Archives' : 'No Results Found' }}
        </h2>
        <p class="opacity-60">
          {{ reports.length === 0 ? 'No reports have been declassified for public viewing yet.' : 'Try adjusting your search terms.' }}
        </p>
        <div v-if="reports.length === 0" class="mt-4 text-sm text-[#00A651] font-mono">STATUS: COMING SOON</div>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RouterLink 
          v-for="report in filteredReports" 
          :key="report._id"
          :to="'/reports/' + report._id"
          class="group k-card overflow-hidden hover:scale-[1.02] transition-all duration-300 flex flex-col"
        >
          <div class="h-48 bg-black/40 relative overflow-hidden border-b border-white/5">
            <img 
              v-if="report.coverImage" 
              :src="report.coverImage" 
              class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-white/5 text-4xl opacity-30">
              📄
            </div>
            
            <div class="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border border-white/10 text-[#00A651]">
              PDF
            </div>
          </div>

          <div class="p-6 flex-1 flex flex-col">
            <div class="text-xs font-bold opacity-40 mb-2 uppercase tracking-widest">
              {{ new Date(report.date).toLocaleDateString() }}
            </div>
            <h3 class="text-2xl font-bold mb-3 group-hover:text-[#00A651] transition">
              {{ report.title }}
            </h3>
            <p class="opacity-60 text-sm line-clamp-3 mb-6 flex-1">
              {{ report.description }}
            </p>
            <div class="flex items-center text-sm font-bold text-[#00A651] gap-2 mt-auto">
              Read Report <span>→</span>
            </div>
          </div>
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api'

const reports = ref([])
const loading = ref(true)
const searchQuery = ref('')

// Filter Logic
const filteredReports = computed(() => {
  if (!searchQuery.value) return reports.value
  const q = searchQuery.value.toLowerCase()
  return reports.value.filter(r => 
    r.title.toLowerCase().includes(q) || 
    (r.description && r.description.toLowerCase().includes(q))
  )
})

onMounted(async () => {
  try {
    const { data } = await api.get('/reports')
    reports.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
