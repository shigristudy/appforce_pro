<script setup>
import { onMounted, ref } from "vue";
import Stripe from "./components/Stripe.vue";
import BrainTree from "./components/BrainTree.vue";
import axios from "axios";
import IconStripe from "./components/icons/Stripe.vue";
import IconBraintree from "./components/icons/Braintree.vue";
const method = ref("");
const selectedPlan = ref(null);

const BASE_URL = import.meta.env.VITE_BASE_URL;
const PLANS_API = `${BASE_URL}/plans`;
const plans = ref([]);

onMounted(async () => {
  const { data } = await axios.get(PLANS_API);
  plans.value = data;
});

const selectPlan = (plan) => {
  selectedPlan.value = plan;
  method.value = ""; // Reset payment method selection
};
</script>

<template>
  <div class="min-w-[500px] flex flex-col items-center py-10 space-y-5">
    <div v-if="!selectedPlan" class="plans-list w-full max-w-xl">
      <h2 class="text-2xl font-bold mb-6 text-center">Available Plans</h2>
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-item border p-6 rounded-lg mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
        @click="selectPlan(plan)"
      >
        <h3 class="text-xl font-semibold mb-2">{{ plan.name }}</h3>
        <p class="text-gray-700 mb-1">
          <span class="font-bold">Price:</span> ${{ plan.price }}
          {{ plan.currency }}
        </p>
        <p class="text-gray-700 mb-1">
          <span class="font-bold">Duration:</span> {{ plan.duration }}
          {{ plan.duration_unit }}(s)
        </p>
        <p class="text-gray-700">
          <span class="font-bold">Max Devices:</span> {{ plan.max_devices }}
        </p>
      </div>
    </div>
    <div v-if="selectedPlan" class="w-full max-w-xl">
      <div class="selected-plan border p-6 rounded-lg mb-4">
        <h3 class="text-xl font-semibold mb-2">{{ selectedPlan.name }}</h3>
        <p class="text-gray-700 mb-1">
          <span class="font-bold">Price:</span> ${{ selectedPlan.price }}
          {{ selectedPlan.currency }}
        </p>
        <p class="text-gray-700 mb-1">
          <span class="font-bold">Duration:</span> {{ selectedPlan.duration }}
          {{ selectedPlan.duration_unit }}(s)
        </p>
        <p class="text-gray-700">
          <span class="font-bold">Max Devices:</span>
          {{ selectedPlan.max_devices }}
        </p>
      </div>
      <div class="flex justify-center items-center space-x-5 mb-4">
        <button
          class="flex items-center w-full justify-center px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-300"
          @click="method = 'stripe'"
        >
        <IconStripe />
        Stripe
        </button>
        <button
          class="flex items-center w-full justify-center px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-300"
          @click="method = 'braintree'"
        >
          <IconBraintree />
          Braintree
        </button>
      </div>
      <Stripe :plan="selectedPlan" v-if="method == 'stripe'" />
      <BrainTree :plan="selectedPlan" v-if="method == 'braintree'" />
    </div>
  </div>
</template>

<style scoped>
.plan-item {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
}
.plan-item:hover {
  background-color: #ffffff;
}
.selected-plan {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
}
</style>
