<template>
  <form id="payment-form" v-show="!loading && !paymentCompleted"
    class="max-w-xl m-auto flex flex-col justify-center items-center bg-white shadow-lg p-6 rounded-md my-2">
    <div id="payment-element" class="w-full">
      <!-- Stripe will create form elements here -->
    </div>
    <div id="link-authentication-element" class="w-full">
      <!-- Stripe will create link authentication elements here -->
    </div>
    <div class="w-full p-2 flex justify-start items-center">
      <input type="checkbox" id="terms" v-model="termsChecked" required />
      <label for="terms" class="pl-1 text-sm cursor-pointer flex justify-center items-center">By clicking on the Pay
        button, you agree to our
        <a target="_blank" href="https://appforcepro.com/terms-and-conditions/" class="text-blue-500">Terms &
          Conditions</a></label>
    </div>
    <button :disabled="!isFormComplete || processing || !termsChecked"
      class="bg-blue-500 w-full text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 self-start disabled:bg-gray-400"
      type="submit" @click="handleSubmit">
      {{ processing ? "Processing..." : "Pay " + symbols[plan.currency] + plan.price }}
    </button>

    <div v-if="message" class="mt-2 text-center text-sm text-white p-2 font-bold" :class="
        message.includes('Successful') ? 'text-green-500' : 'text-red-500'
      ">
      {{ message }}
    </div>
  </form>
  <div v-show="loading" class="text-center text-sm p-2 font-bold text-blue-500">
    Loading Payment Form Please Wait...
  </div>
  <PaymentSuccess :device_id="device_id" v-if="paymentCompleted" />
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
const token = ref(null);
const stripe = ref(null);
const elements = ref(null);
const isFormComplete = ref(false);
const termsChecked = ref(false);
import PaymentSuccess from "./PaymentSuccess.vue";
import symbols from "./../currency";
const props = defineProps({
  plan: Object,
  device_id: String
});


onMounted(() => {
  setupStripe();
});

watch(
  () => props.plan,
  () => {
    setupStripe();
  }
);

const BASE_URL = import.meta.env.VITE_BASE_URL;
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_API_KEY;
const INITIATE_PAYMENT_API = `${BASE_URL}/stripe/initiate`;
const PAYMENT_SUCCESS_API = `${BASE_URL}/stripe/complete`;
const PAYMENT_FAILURE_API = `${BASE_URL}/stripe/failure`;
const PAYMENT_INTENT_ID = ref(null);
const loading = ref(true);
const paymentCompleted = ref(false);
const processing = ref(false);

const setupStripe = () => {
  if (!props.plan) return;

  axios
    .post(INITIATE_PAYMENT_API, {
      device_id: props.device_id,
      plan_id: props.plan.id,
    })
    .then((response) => {
      const res = response.data;
      PAYMENT_INTENT_ID.value = res.payment_intent_id;
      token.value = res.token; // Use to identify the payment
      stripe.value = Stripe(STRIPE_PUBLISHABLE_KEY);
      const options = {
        clientSecret: res.client_secret,
        appearance: {
          theme: "stripe",
        },
      };

      elements.value = stripe.value.elements(options);

      const paymentElement = elements.value.create("payment", {
        layout: {
          type: "tabs",
          defaultCollapsed: false,
          radios: true,
          spaced: true,
        },
      });
      paymentElement.mount("#payment-element");

      // const linkAuthenticationElement = elements.value.create('linkAuthentication');
      // linkAuthenticationElement.mount('#link-authentication-element');

      paymentElement.on("change", (event) => {
        isFormComplete.value = event.complete;
      });

      loading.value = false;
    })
    .catch((error) => {
      console.error(error);
      loading.value = false;
    });
};

const message = ref(null);
const handleSubmit = async (e) => {
  e.preventDefault();
  processing.value = true;

  const { error } = await stripe.value.confirmPayment({
    elements: elements.value,
    confirmParams: {
      return_url: window.location.href,
    },
    redirect: "if_required",
  });

  if (error === undefined) {

    axios.post(PAYMENT_SUCCESS_API, {
      payment_intent_id: PAYMENT_INTENT_ID.value,
    });
  } else {
    axios.post(PAYMENT_FAILURE_API, {
      payment_intent_id: PAYMENT_INTENT_ID.value,
      code: error.code,
      description: error.message,
    });
  }

  paymentCompleted.value = true;
  // Show Message of Payment Success or Failure
  message.value = error ? error.message : "Payment Successful";
  processing.value = false;
};
</script>
