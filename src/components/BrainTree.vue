<template>
  <div v-show="!loading && !paymentCompleted"
    class="max-w-xl m-auto flex flex-col justify-center items-center bg-white shadow-lg p-6 rounded-md my-2">
    <div id="braintree-drop-in-container" class="!border-none"></div>
    <div v-show="dropinInstance" class="w-full p-2 flex justify-start items-center">
      <input type="checkbox" id="terms" v-model="termsChecked" required />
      <label for="terms" class="pl-1 text-sm cursor-pointer flex justify-center items-center gap-1">By clicking on the Pay button, you agree to our
        <a target="_blank" href="https://appforcepro.com/terms-conditions/" class="text-blue-500"> Terms &
          Conditions</a></label>
    </div>
    <button v-show="dropinInstance" :disabled="!isFormComplete || processing || !termsChecked"
      class="bg-blue-500 w-full text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 self-start disabled:bg-gray-400"
      type="submit" @click="handlePayment">
      {{ processing ? "Processing..." : "Pay " + symbols[plan.currency] + plan.price }}
    </button>


    <div v-if="message" class="mt-2 text-center text-sm p-2 font-bold" :class="
        message.includes('Successful') ? 'text-green-500' : 'text-red-500'
      ">
      {{ message }}
    </div>
  </div>
  <div v-show="loading" class="text-center text-sm p-2 font-bold text-blue-500">
    Loading Payment Form Please Wait...
  </div>
  <PaymentSuccess :device_id="device_id" v-if="paymentCompleted" />
</template>

<script setup>
import dropin from "braintree-web-drop-in";
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import PaymentSuccess from "./PaymentSuccess.vue";
import symbols from "./../currency";


const props = defineProps({
  plan: Object,
  device_id: String,
  billingInfo: Object,
});

const termsChecked = ref(false);
const BASE_URL = import.meta.env.VITE_BASE_URL;
const INITIATE_PAYMENT_API = `${BASE_URL}/braintree/initiate`;
const PROCESS_PAYMENT_API = `${BASE_URL}/braintree/process_payment`;
const PAYMENT_SUCCESS_API = `${BASE_URL}/braintree/complete`;
const PAYMENT_FAILURE_API = `${BASE_URL}/braintree/failure`;
const PAYMENT_ID = ref(null);

const dropinInstance = ref(null);
const message = ref(null);
const loading = ref(true);
const paymentCompleted = ref(false);
const processing = ref(false);
const isFormComplete = computed(() => dropinInstance.value !== null);

onMounted(async () => {
  setupBraintree();
});

watch(() => props.plan, () => {
  () => props.plan,
    () => {
      setupBraintree();
    }
});

const setupBraintree = async () => {
  if (!props.plan) return;

  const { data } = await axios.post(INITIATE_PAYMENT_API, {
    device_id: props.device_id,
    currency: props.plan.currency,
    plan_id: props.plan.id,
    billings: billingInfo
  });
  initializeBraintreeDropin(data.clientToken);
};

const initializeBraintreeDropin = (clientToken) => {
  dropin.create(
    {
      authorization: clientToken,
      container: "#braintree-drop-in-container",
      card: {
        overrides: {
          fields: {
            cvv: {
              required: true,
            },
          },
        },
      },
      applePay: {
        displayName: "Appforce Pro",
        paymentRequest: {
          total: {
            label: "Appforce Pro",
            amount: props.plan.price,
          },
        },
      },
      googlePay: {
        googlePayVersion: 2,
        transactionInfo: {
          currencyCode: props.plan.currency,
          totalPriceStatus: "FINAL",
          totalPrice: props.plan.price,
        },
      },
    },
    (error, instance) => {
      if (error) {
        console.error(error);
        return;
      }
      dropinInstance.value = instance;
      loading.value = false;
    }
  );
  loading.value = false;
};

const handlePayment = () => {
  if (dropinInstance.value) {
    processing.value = true;
    dropinInstance.value.requestPaymentMethod((err, payload) => {
      if (err) {
        console.error("Payment method error:", err);
        message.value = "Payment method error. Please try again.";
        processing.value = false;
        return;
      }

      axios
        .post(PROCESS_PAYMENT_API, {
          nonce: payload.nonce,
          device_id: props.device_id,
          plan_id: props.plan.id,
          billings: props.billingInfo
        })
        .then((response) => {
          
          PAYMENT_ID.value = response.data.transaction_id;
          axios.post(PAYMENT_SUCCESS_API, {
            payment_id: PAYMENT_ID.value,
            billings: props.billingInfo
          });
          paymentCompleted.value = true;
          message.value = "Payment Successful!";
        })
        .catch((error) => {
          message.value = "Payment failed. Please try again.";
          console.error("Payment error:", error);
          axios.post(PAYMENT_FAILURE_API, {
            payment_id: PAYMENT_ID.value,
            billings: props.billingInfo
          });
        })
        .finally(() => {
          processing.value = false;
        });
    });
  }
};
</script>
