<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-dark-bg py-20">
    <div class="max-w-4xl mx-auto px-4 text-center">
      
      <h1 class="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
        The Empathy <span class="text-celtics-green">Quotient</span>
      </h1>
      
      <p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
        Inspired by Simon Baron-Cohen’s <em>The Science of Evil</em>, this application explores how empathy functions across individuals.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-card-bg p-8 rounded-2xl border border-gray-800 hover:border-celtics-green transition-all hover:-translate-y-2 group">
          <div class="text-4xl mb-4">👤</div>
          <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-celtics-green">Adult EQ</h2>
          <p class="text-gray-500 mb-6 text-sm">Assess your own empathy levels using the standard 40-question Baron-Cohen test.</p>
          <RouterLink to="/empathy/survey/adult" class="inline-block w-full py-3 bg-celtics-green text-white font-bold rounded-lg hover:bg-[#00632a] transition-colors">
            Start Survey
          </RouterLink>
        </div>

        <div class="bg-card-bg p-8 rounded-2xl border border-gray-800 hover:border-celtics-green transition-all hover:-translate-y-2 group">
          <div class="text-4xl mb-4">👶</div>
          <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-celtics-green">Child EQ</h2>
          <p class="text-gray-500 mb-6 text-sm">Assessment for guardians to evaluate empathy traits in children.</p>
          <RouterLink to="/empathy/survey/child" class="inline-block w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">
            Start Survey
          </RouterLink>
        </div>

        <div class="bg-card-bg p-8 rounded-2xl border border-gray-800 hover:border-red-500 transition-all hover:-translate-y-2 group">
          <div class="text-4xl mb-4">🚫</div>
          <h2 class="text-2xl font-bold text-white mb-3 group-hover:text-red-500">Zero Degrees</h2>
          <p class="text-gray-500 mb-6 text-sm">Explore traits associated with extremely low empathy (Borderline, Narcissism, etc).</p>
          <RouterLink to="/empathy/zero" class="inline-block w-full py-3 bg-red-900/20 border border-red-900 text-red-500 font-bold rounded-lg hover:bg-red-900/40 transition-colors">
            Learn More
          </RouterLink>
        </div>

      </div>

    </div>
  </div>
</template>