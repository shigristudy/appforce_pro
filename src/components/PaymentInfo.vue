<template>
  <div class="flex flex-col items-center justify-center bg-white rounded-md shadow-lg border border-gray-200">
    <div
      class="p-8 text-center flex flex-col items-center justify-center gap-2"
    >
      <div v-if="icon" class="mb-4">
        <component :is="icon" class="w-16 h-16 text-green-500" />
      </div>
      <h1 class="text-3xl font-bold text-green-500 mb-2">{{ info }}</h1>
      <p class="text-lg text-gray-700 mb-4">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup>
// props
const props = defineProps({
  info: String,
  description: String,
  icon: Object
});
</script>