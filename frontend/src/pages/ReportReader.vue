<template>
  <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
    <div class="bg-black/80 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <RouterLink to="/reports" class="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition text-white">
          ← Back to Library
        </RouterLink>

        <div class="flex gap-3">
          <a 
            v-if="report"
            :href="report.pdfUrl" 
            download 
            class="px-4 py-2 rounded-lg bg-[#00A651] text-white font-bold text-sm hover:bg-[#008f45] transition flex items-center gap-2"
          >
             Download PDF 📥
          </a>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="animate-pulse opacity-50 text-xl font-mono">Loading Document...</div>
    </div>

    <div v-else-if="report" class="flex-1 p-4 md:p-8 flex flex-col items-center">
      <div class="max-w-4xl w-full mb-8 text-center">
        <h1 class="text-3xl md:text-4xl font-black mb-4 text-white">{{ report.title }}</h1>
        <p class="opacity-60 max-w-2xl mx-auto">{{ report.description }}</p>
      </div>

      <div class="w-full max-w-5xl aspect-[8.5/11] bg-white rounded-lg shadow-2xl overflow-hidden border border-white/10">
        <iframe 
          :src="report.pdfUrl" 
          class="w-full h-full"
          frameborder="0"
        ></iframe>
      </div>
      
      <div class="mt-8 text-center opacity-40 text-sm pb-8">
        Author: Kyriq Cole • Published: {{ new Date(report.date).toLocaleDateString() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'

const route = useRoute()
const report = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/reports/${route.params.id}`)
    report.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
