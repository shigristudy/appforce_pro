<script setup>
import { onMounted, ref } from "vue";
import Stripe from "./components/Stripe.vue";
import BrainTree from "./components/BrainTree.vue";
import PaymentInfo from "./components/PaymentInfo.vue";
import axios from "axios";
import IconStripe from "./components/icons/Stripe.vue";
import IconBraintree from "./components/icons/Braintree.vue";
import Loader from "./components/icons/Loader.vue"; // Assuming you have an icon for warnings
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import Info from "./components/Info.vue";
import BillingForm from "./components/BillingForm.vue";

const method = ref("");
const enableGateways = ref("");
const selectedPlan = ref([]);
const BASE_URL = import.meta.env.VITE_BASE_URL;
const INVOICE_LINK = import.meta.env.VITE_INVOICE_LINK;
const PLANS_API = `${BASE_URL}/plans`;
const ENABLE_GATEWAYS_API = `${BASE_URL}/enable-gateways`;

const device_id = ref("");
const invoiceLink = ref("");
const plans = ref([]);
const message = ref("");
const info = ref("");
const description = ref("");
const icon = ref(null);
const loaded = ref(false);
const billingInfo = ref(null);
const isFormValidated = ref(false);

const handleFormValidated = (status) => {
  isFormValidated.value = status;
  // Scroll to payment methods when billing is validated
  if (status) {
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY + 200,
        behavior: "smooth",
      });
    }, 100);
  }
};

onMounted(async () => {
  device_id.value = window?.config?.DEVICE_ID ?? "FC:A4:7A:A9:77:26";

  let isDev = window.location.href.includes("localhost");

  if (!isDev) {
    if (!device_id.value) {
      info.value = "Device Mac ID Not Found";
      description.value = "Please provide a valid device Mac ID in the URL.";
      icon.value = IconWarning;
      loaded.value = true;
      return;
    }
    // check device already purchased
    const check = await checkDevicePurchased(device_id.value);

    if (!check.isvalid) {
      info.value = "Device Mac ID Not Found";
      description.value = "Please provide a valid device Mac ID in the URL.";
      icon.value = IconWarning;
      loaded.value = true;
      return;
    }

    if (check.purcahsed) {
      info.value = "Already Subscribed";
      description.value =
        "You have already purchased AppForce Pro Player License.";
      icon.value = IconWarning;
      loaded.value = true;
      return;
    }
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

  loaded.value = true;
  const ENABLE_GATEWAYS = await axios.get(ENABLE_GATEWAYS_API);
  enableGateways.value = ENABLE_GATEWAYS.data;
});

const checkDevicePurchased = async (device_id) => {
  const CHECK_PURCHASED_API = `${BASE_URL}/check-purchased`;
  const { data } = await axios.post(CHECK_PURCHASED_API, {
    device_id,
  });
  return data;
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <div
      class="flex-grow bg-[#f0f2f9] flex flex-col items-center py-10 px-6 space-y-5"
    >
      <div v-if="loaded">
        <div class="w-full max-w-xl" v-if="!info">
          <Info :selectedPlan="selectedPlan" />
          <BillingForm
            v-model:billingInfo="billingInfo"
            @formValidated="handleFormValidated"
          />

          <div v-if="isFormValidated" class="space-y-4">
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
                :billingInfo="billingInfo"
                :device_id="device_id"
                :public_key="enableGateways.keys.stripe_public_key"
                v-if="
                  method == 'stripe' ||
                  (enableGateways.stripe &&
                    !method &&
                    !enableGateways.brainTree)
                "
              />
              <BrainTree
                :plan="selectedPlan"
                :billingInfo="billingInfo"
                :device_id="device_id"
                v-if="
                  method == 'braintree' ||
                  (enableGateways.brainTree &&
                    !method &&
                    !enableGateways.stripe)
                "
              />
            </div>
          </div>
        </div>
        <div v-else>
          <PaymentInfo :info="info" :description="description" :icon="icon" />
        </div>
      </div>
      <div v-else class="w-full max-w-xl flex justify-center items-center">
        <Loader />
      </div>
    </div>
    <AppFooter />
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
