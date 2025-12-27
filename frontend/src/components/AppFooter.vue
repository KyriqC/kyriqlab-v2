<template>
  <footer id="contact-footer" class="border-t border-white/10 bg-black/20">
    <div class="max-w-6xl mx-auto px-4 py-12">
      <!-- Main Footer Grid -->
      <div class="grid md:grid-cols-3 gap-10 md:gap-8">
        
        <!-- Brand Column -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[#00A651]/20 border border-[#00A651]/30 flex items-center justify-center">
              <span class="text-[#00A651] font-bold text-lg">K</span>
            </div>
            <span class="font-semibold text-lg tracking-wide">KyriqLab</span>
          </div>
          <p class="text-sm opacity-70 leading-relaxed max-w-xs">
            Building enterprise-grade solutions from my home lab. Cybersecurity, full-stack development, and everything in between.
          </p>
          <!-- System Status Badge -->
          <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00A651]/30 bg-[#00A651]/10 text-sm">
            <span class="w-2 h-2 rounded-full bg-[#00A651] animate-pulse"></span>
            <span class="text-[#00A651] font-medium">System Operational</span>
          </div>
        </div>

        <!-- Quick Links Column -->
        <div>
          <h4 class="font-semibold mb-4 text-sm uppercase tracking-wider opacity-80">Quick Links</h4>
          <nav class="flex flex-col gap-3">
            <RouterLink to="/" class="footer-link text-sm opacity-70 hover:opacity-100 hover:text-[#00A651] transition-all">
              Home
            </RouterLink>
            <RouterLink to="/notepad" class="footer-link text-sm opacity-70 hover:opacity-100 hover:text-[#00A651] transition-all">
              Notepad / Blog
            </RouterLink>
            <RouterLink to="/lyric-blitz" class="footer-link text-sm opacity-70 hover:opacity-100 hover:text-[#00A651] transition-all">
              Lyric Blitz
            </RouterLink>
            <RouterLink to="/empathy-eq" class="footer-link text-sm opacity-70 hover:opacity-100 hover:text-[#00A651] transition-all">
              Empathy EQ
            </RouterLink>
          </nav>
        </div>

        <!-- Connect Column -->
        <div>
          <h4 class="font-semibold mb-4 text-sm uppercase tracking-wider opacity-80">Connect</h4>
          <div class="flex flex-col gap-3">
            <a 
              href="https://github.com/KyriqC" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#00A651]/30 transition-all text-sm"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a 
              href="https://linkedin.com/in/kyriq-cole/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#00A651]/30 transition-all text-sm"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn
            </a>
            <a 
              id="mailto-btn"
              href="mailto:kecole2@cougarnet.uh.edu"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A651] text-black font-medium hover:bg-[#00A651]/90 transition-all text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Me
            </a>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-white/10 mt-10 pt-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Copyright -->
          <p class="text-xs opacity-50">
            © {{ new Date().getFullYear() }} Kyriq Cole. All rights reserved.
          </p>
          <!-- Tech Stack -->
          <p class="text-xs opacity-50">
            Built with Vue 3 & Tailwind CSS • Deployed on Homelab
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.footer-link {
  position: relative;
  width: fit-content;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: #00A651;
  transition: width 0.3s ease;
}

.footer-link:hover::after {
  width: 100%;
}

/* Accent ring animation for mailto button highlight */
.accent-ring {
  animation: ring-pulse 1.5s ease-out;
}

@keyframes ring-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 166, 81, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 166, 81, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 166, 81, 0);
  }
}
</style>
