<template>
  <div
    v-show="!loading && !paymentCompleted"
    class="max-w-xl m-auto flex flex-col justify-center items-center border border-gray-300 p-2 rounded-md my-2"
  >
    <div id="braintree-drop-in-container"></div>

    <button
      v-show="dropinInstance"
      :disabled="!isFormComplete || processing"
      class="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 self-start disabled:bg-gray-400"
      type="submit"
      @click="handlePayment"
    >
      {{ processing ? "Processing..." : "Pay Now" }}
    </button>

    <div
      v-if="message"
      class="mt-2 text-center text-sm p-2 font-bold"
      :class="
        message.includes('Successful') ? 'text-green-500' : 'text-red-500'
      "
    >
      {{ message }}
    </div>
  </div>
  <div v-show="loading" class="text-center text-sm p-2 font-bold text-blue-500">
    Loading Payment Form Please Wait...
  </div>
  <PaymentSuccess v-if="paymentCompleted" />
</template>

<script setup>
import dropin from "braintree-web-drop-in";
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import PaymentSuccess from "./PaymentSuccess.vue";

const props = defineProps({
  plan: Object
});

const BASE_URL = import.meta.env.VITE_BASE_URL;
const INITIATE_PAYMENT_API = `${BASE_URL}/braintree/initiate`;
const PROCESS_PAYMENT_API = `${BASE_URL}/braintree/process_payment`;
const PAYMENT_SUCCESS_API = `${BASE_URL}/braintree/complete`;
const PAYMENT_FAILURE_API = `${BASE_URL}/braintree/failure`;
const PAYMENT_INTENT_ID = ref(null);

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
  setupBraintree();
});

const setupBraintree = async () => {
  if (!props.plan) return;

  const { data } = await axios.post(INITIATE_PAYMENT_API, {
    amount: props.plan.price,
    currency: props.plan.currency,
    plan_id: props.plan.id
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
        })
        .then((response) => {
          PAYMENT_INTENT_ID.value = response.data;
          axios.post(PAYMENT_SUCCESS_API, {
            payment_intent_id: PAYMENT_INTENT_ID.value,
          });
          paymentCompleted.value = true;
          message.value = "Payment Successful!";
        })
        .catch((error) => {
          message.value = "Payment failed. Please try again.";
          console.error("Payment error:", error);
          axios.post(PAYMENT_FAILURE_API, {
            payment_intent_id: PAYMENT_INTENT_ID.value,
          });
        })
        .finally(() => {
          processing.value = false;
        });
    });
  }
};
</script>
