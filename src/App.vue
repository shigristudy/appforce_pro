<script setup>
import { onMounted, ref } from "vue";
import Stripe from "./components/Stripe.vue";
import BrainTree from "./components/BrainTree.vue";
import PaymentInfo from "./components/PaymentInfo.vue";
import axios from "axios";
import IconStripe from "./components/icons/Stripe.vue";
import IconBraintree from "./components/icons/Braintree.vue";
import IconWarning from "./components/icons/Warning.vue"; // Assuming you have an icon for warnings
import Loader from "./components/icons/Loader.vue"; // Assuming you have an icon for warnings
import symbols from "./currency";

const method = ref("");
const enableGateways = ref("");
const selectedPlan = ref([]);
const BASE_URL = import.meta.env.VITE_BASE_URL;
const INVOICE_LINK = import.meta.env.VITE_INVOICE_LINK;
const PLANS_API = `${BASE_URL}/plans`;
const ENABLE_GATEWAYS_API = `${BASE_URL}/enable-gateways`;

const device_id = ref("");
const invoiceLink = ref("")
const plans = ref([]);
const message = ref("");
const info = ref("");
const description = ref("");
const icon = ref(null);
const loaded = ref(false);
onMounted(async () => {
  // check if device_id is present in the url
  const urlParams = new URLSearchParams(window.location.search);
  device_id.value = urlParams.get("device_id");
  if (!device_id.value) {
    info.value = "Device ID Missing";
    description.value = "Please provide a valid device ID in the URL.";
    icon.value = IconWarning;
    loaded.value = true
    return;
  }
  // check device already purchased
  const check = await checkDevicePurchased(device_id.value);
  
  if (check) {
    info.value = "Already Subscribed";
    description.value = "You have already purchased AppForce Pro Player License.";
    icon.value = IconWarning;
    loaded.value = true
    return;
  }

  invoiceLink.value = `${INVOICE_LINK}?device_id=${device_id.value}`;

  const { data } = await axios.get(PLANS_API);
  plans.value = data;
  selectedPlan.value = {
    id: plans.value[0].id,
    name: plans.value[0].name,
    price: plans.value[0].price,
    currency: plans.value[0].currency,
  };
  
  loaded.value = true
  const ENABLE_GATEWAYS = await axios.get(ENABLE_GATEWAYS_API);
  enableGateways.value = ENABLE_GATEWAYS.data;
});

const checkDevicePurchased = async (device_id) => {
  const CHECK_PURCHASED_API = `${BASE_URL}/check-purchased`;
  const { data } = await axios.post(CHECK_PURCHASED_API, {
    device_id,
  });
  if (data.success) {
    return true;
  }
  return false;
};
</script>

<template>
  <div
    class="min-w-[500px] bg-[#f0f2f9] min-h-screen flex flex-col items-center py-10 px-6 space-y-5"
  >
  <div v-if="loaded">
    <div class="w-full max-w-xl" v-if="!info">
      <div
        class="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-xl mb-6 mx-auto"
      >
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-5xl font-bold mb-3 text-gray-900">
              {{ symbols[selectedPlan.currency] }} {{ selectedPlan.price }}
            </h2>
            <p class="text-md text-gray-500">
              <span class="font-semibold">Licence:</span>
              {{ selectedPlan.name }}
            </p>
          </div>
          <div class="text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="7em"
              height="7em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3.5 5A2.5 2.5 0 0 1 6 2.5h10A2.5 2.5 0 0 1 18.5 5v5.5a.5.5 0 0 1-1 0V5A1.5 1.5 0 0 0 16 3.5H6A1.5 1.5 0 0 0 4.5 5v14.382a.5.5 0 0 0 .724.447l1-.5a1.5 1.5 0 0 1 1.57.142l.906.679a.5.5 0 0 0 .6 0l.862-.647a1.5 1.5 0 0 1 1.672-.086l.673.404a.5.5 0 1 1-.514.858l-.674-.404a.5.5 0 0 0-.557.028l-.862.647a1.5 1.5 0 0 1-1.8 0l-.906-.68a.5.5 0 0 0-.523-.046l-1 .5A1.5 1.5 0 0 1 3.5 19.382z"
              />
              <path
                fill="currentColor"
                d="M6.5 7a.5.5 0 0 1 .5-.5h6.5a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5m0 3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5m0 3a.5.5 0 0 1 .5-.5h3.5a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5m11-1.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6m-4 3a4 4 0 1 1 8 0a4 4 0 0 1-8 0m5.666-1.229a.5.5 0 0 1 0 .708l-2.104 2.103l-1.228-1.228a.5.5 0 0 1 .707-.708l.521.522l1.397-1.397a.5.5 0 0 1 .707 0"
              />
            </svg>
          </div>
        </div>
        <div class="space-y-1 text-gray-700">
          <!-- <span class="font-semibold">{{ selectedPlan.name }}</span> -->
          <div class="text-justify">
            <span class="text-lg font-semibold">Note:</span>
            <ul class="list-disc list-inside">
              <li>AppForce PRO PLAYER is a video media player.</li>
              <li>We do not sell playlists, subscriptions, or channels.</li>
              <li>We do not include any content.</li>
              <li>
                We are not responsible for the content accessed through the app.
              </li>
              <li>All purchases are final and non-refundable.</li>
            </ul>
          </div>
        </div>

        <div class="mt-4">
          <a
            target="_blank"
            :href="invoiceLink"
            class="text-blue-500 font-semibold cursor-pointer hover:underline"
          >
            View invoice details →
          </a>
        </div>
      </div>
      <div
        v-if="enableGateways.stripe && enableGateways.brainTree"
        class="flex justify-center items-center space-x-5 mb-4"
      >
        <button
          class="flex items-center w-full justify-center px-4 py-2 border bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-300"
          @click="method = 'stripe'"
        >
          <IconStripe />
          Stripe
        </button>
        <button
          class="flex items-center w-full justify-center px-4 py-2 border bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-300"
          @click="method = 'braintree'"
        >
          <IconBraintree />
          Braintree
        </button>
      </div>
      <div>
        <Stripe
          :plan="selectedPlan"
          :device_id="device_id"
          v-if="
            method == 'stripe' ||
            (enableGateways.stripe && !method && !enableGateways.brainTree)
          "
        />
        <BrainTree
          :plan="selectedPlan"
          :device_id="device_id"
          v-if="
            method == 'braintree' ||
            (enableGateways.brainTree && !method && !enableGateways.stripe)
          "
        />
      </div>
    </div>
    <div v-else>
      <PaymentInfo :info="info" :description="description" :icon="icon" />
    </div>
  </div>
  <div v-else class="w-full max-w-xl flex justify-center items-center">
    <Loader/>
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
