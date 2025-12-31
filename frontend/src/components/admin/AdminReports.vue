<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    <div class="lg:col-span-1 space-y-4">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-bold">Existing Reports</h2>
        <button @click="resetForm" class="text-xs k-btn2 px-2 py-1">New</button>
      </div>
      
      <div class="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        <div 
          v-for="report in reports" 
          :key="report._id"
          class="k-card p-4 hover:border-white/20 transition cursor-pointer relative group"
          @click="selectReport(report)"
        >
          <div class="font-bold pr-6">{{ report.title }}</div>
          <div class="text-xs opacity-50 mt-1">{{ new Date(report.date).toLocaleDateString() }}</div>
          
          <button 
            @click.stop="deleteReport(report._id)"
            class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-red-500/20 p-1 rounded"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 k-card p-6">
      <h2 class="text-xl font-bold mb-6">
        {{ form._id ? 'Edit Report' : 'Create New Report' }}
      </h2>

      <div class="space-y-6">
        
        <div>
          <label class="block text-xs font-bold opacity-60 uppercase mb-2">Title</label>
          <input v-model="form.title" type="text" class="w-full k-inp" placeholder="e.g. Technical Practices Overview" />
        </div>

        <div>
          <label class="block text-xs font-bold opacity-60 uppercase mb-2">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full k-inp" placeholder="Brief summary..."></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold opacity-60 uppercase mb-2">PDF Document</label>
            <div v-if="form.pdfUrl" class="text-xs text-[#00A651] mb-2 break-all">
              ✓ File Linked: ...{{ form.pdfUrl.slice(-20) }}
            </div>
            <input type="file" accept="application/pdf" @change="e => uploadFile(e, 'pdf')" class="text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold opacity-60 uppercase mb-2">Cover Image</label>
            <div v-if="form.coverImage" class="mb-2">
              <img :src="form.coverImage" class="h-20 rounded border border-white/20" />
            </div>
            <input type="file" accept="image/*" @change="e => uploadFile(e, 'image')" class="text-sm" />
          </div>
        </div>

        <div class="flex items-center gap-3 py-2">
          <input type="checkbox" v-model="form.published" id="pub" class="w-5 h-5 accent-[#00A651]" />
          <label for="pub" class="font-bold cursor-pointer">Published (Visible to Public)</label>
        </div>

        <div class="flex gap-4 pt-4 border-t border-white/10">
          <button @click="resetForm" class="px-6 py-3 k-btn2">Cancel</button>
          <button 
            @click="saveReport" 
            class="flex-1 py-3 k-btn"
            :disabled="uploading || !form.title || !form.pdfUrl"
          >
            {{ uploading ? 'Uploading...' : 'Save Report' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, getAdminKey } from '../../services/api'

const reports = ref([])
const uploading = ref(false)

const form = ref({
  _id: null,
  title: '',
  description: '',
  pdfUrl: '',
  coverImage: '',
  published: true
})

async function loadReports() {
  const { data } = await api.get('/reports') // Note: Fetching public list mostly, Admin endpoint usually better for drafts
  reports.value = data
}

function resetForm() {
  form.value = { _id: null, title: '', description: '', pdfUrl: '', coverImage: '', published: true }
}

function selectReport(r) {
  form.value = { ...r }
}

async function uploadFile(event, type) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  uploading.value = true
  try {
    // FIX: Manually attach the Admin Key to ensure it's sent
    const headers = { 
      'Content-Type': 'multipart/form-data',
      'x-admin-key': getAdminKey() 
    }

    const { data } = await api.post('/uploads', formData, { headers })
    
    if (type === 'pdf') form.value.pdfUrl = data.url
    if (type === 'image') form.value.coverImage = data.url

  } catch (e) {
    alert('Upload failed: ' + (e.response?.data?.error || e.message))
    console.error(e)
  } finally {
    uploading.value = false
  }
}

async function saveReport() {
  try {
    const headers = { 'x-admin-key': getAdminKey() }
    
    // NOTE: Backend logic provided earlier didn't have specific EDIT (PUT) route, 
    // we'll assume creating new for now or logic handles it. 
    // If you need edit, we'd add router.put('/:id') to backend.
    // For now, let's treat everything as CREATE (POST).
    // To support edit properly, delete old and create new is a quick hack if PUT isn't made.
    
    if (form.value._id) {
       // Quick Hack: Delete old then create new (since we didn't add PUT route yet)
       await api.delete(`/reports/${form.value._id}`, { headers })
    }

    await api.post('/reports', form.value, { headers })
    
    await loadReports()
    resetForm()
  } catch (e) {
    alert('Failed to save')
    console.error(e)
  }
}

async function deleteReport(id) {
  if (!confirm('Delete this report?')) return
  try {
    await api.delete(`/reports/${id}`, { headers: { 'x-admin-key': getAdminKey() } })
    await loadReports()
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadReports)
</script>
