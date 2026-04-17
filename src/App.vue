<template>
  <div id="mbti-app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
</script>

<style>
#mbti-app {
  min-height: 100vh;
}
</style>
