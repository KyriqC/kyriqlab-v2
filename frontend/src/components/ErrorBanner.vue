<template>
  <div v-if="message" class="border border-white/10 bg-white/5 rounded-xl p-4">
    <div class="font-semibold">Error</div>
    <div class="opacity-80 text-sm mt-1">{{ message }}</div>
    <div v-if="detail" class="opacity-70 text-xs mt-2 whitespace-pre-wrap">{{ detail }}</div>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  detail: { type: String, default: '' }
})
</script>
