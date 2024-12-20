<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
    <!-- Header Section -->
    <div class="p-6 border-b border-gray-100">
      <div class="w-full">
        <div class="space-y-1">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            {{ selectedPlan.name }}
          </h1>
          <!-- Price Summary -->
          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{{ symbols[selectedPlan.currency] }}{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>VAT (19%):</span>
              <span>{{ symbols[selectedPlan.currency] }}{{ formatPrice(vatAmount) }}</span>
            </div>
            <div class="h-px bg-gray-200 my-2"></div>
            <div class="flex justify-between text-3xl font-bold text-blue-600">
              <span>Total:</span>
              <span>{{ symbols[selectedPlan.currency] }}{{ formatPrice(grandTotal) }}</span>
            </div>
            <p class="text-sm text-gray-500">*Prices include VAT where applicable</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Important Notes Section -->
    <div class="p-6 border-t border-gray-200">
      <div class="bg-amber-50 rounded-lg p-4">
        <h3 class="font-semibold text-amber-800 mb-3">Important Information:</h3>
        <ul class="space-y-2">
          <li class="flex items-start text-sm text-amber-700">
            <svg class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>AppForce PRO PLAYER is strictly a video media player application</span>
          </li>
          <li class="flex items-start text-sm text-amber-700">
            <svg class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>We do not provide any content, playlists, subscriptions, or channels</span>
          </li>
          <li class="flex items-start text-sm text-amber-700">
            <svg class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>All purchases are final and non-refundable</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer Section -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <p class="text-xs text-gray-500">
        By proceeding with the purchase, you acknowledge that we are not responsible for any content accessed through the application.
      </p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import symbols from "./../currency.js"

const props = defineProps({
  selectedPlan: Object,
});

// Calculate prices
const subtotal = computed(() => Number(props.selectedPlan.price));
const vatAmount = computed(() => subtotal.value * 0.19);
const grandTotal = computed(() => subtotal.value + vatAmount.value);

// Format price to 2 decimal places
const formatPrice = (value) => {
  return value.toFixed(2);
};
</script>

