<template>
  <footer id="contact-footer" class="border-t border-white/10">
    <div class="max-w-6xl mx-auto px-4 py-10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div class="font-semibold">Contact</div>
          <div class="opacity-80 text-sm">Connect with me or send a message.</div>
        </div>

        <div class="flex items-center gap-4 text-sm">
          <a class="link k-btn accent-ring hover:accent-bg hover:text-black" href="https://github.com/KyriqC" target="_blank" rel="noreferrer">GitHub</a>
          <a class="link k-btn accent-ring hover:accent-bg hover:text-black" href="https://linkedin.com/in/kyriq-cole/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a class="link k-btn accent-ring hover:accent-bg hover:text-black" href="mailto:kecole2@cougarnet.uh.edu">Email me</a>
        </div>
      </div>

      <div class="mt-8 text-xs opacity-60">
        © {{ new Date().getFullYear() }} KyriqLab
      </div>
    </div>
  </footer>
</template>

<style scoped>
.link { opacity: 0.85; }
.link:hover { opacity: 1; text-decoration: underline; }
</style>
