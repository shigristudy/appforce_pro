<template>
  <form id="payment-form"
    class="max-w-xl m-auto flex flex-col justify-center items-center border border-gray-300 p-2 rounded-md my-2">
    <div id="payment-element" class=" w-full">
      <!-- Stripe will create form elements here -->
    </div>
    <button class="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 self-start" type="submit"
      @click="handleSubmit">Pay via Stripe</button>

    <div v-if="message" class="mt-2 text-center text-sm text-white p-2 font-bold"
      :class="message.includes('Successful') ? 'text-green-500' : 'text-red-500'">
      {{ message }}
    </div>

  </form>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
const token = ref(null)
const stripe = ref(null)
const elements = ref(null)

onMounted(() => {
  setupStripe()
})
const BASE_URL = "http://127.0.0.1:8000/api/app";
const STRIPE_PUBLISHABLE_KEY = "pk_test_51NSd7OIEpzgpRspxl8geRr48D6D4r0Ol9I7ay8dstoxCHRT4z4TvT2xPGpeVX5L4ODa27YYVnG5DwktvAVf6V5zJ00pWgHxpeW";
const INITIATE_PAYMENT_API = `${BASE_URL}/payment/stripe/initiate`;
const PAYMENT_SUCCESS_API = `${BASE_URL}/payment/stripe/complete`;
const PAYMENT_FAILURE_API = `${BASE_URL}/payment/stripe/failure`;
const PAYMENT_INTENT_ID = ref(null);
const setupStripe = () => {
  axios.post(INITIATE_PAYMENT_API, {
    amount: 150,
    currency: 'USD'
  }).then(response => {
    const res = response.data;
    PAYMENT_INTENT_ID.value = res.payment_intent_id;
    token.value = res.token // Use to identify the payment
    stripe.value = Stripe(STRIPE_PUBLISHABLE_KEY);
    const options = {
      clientSecret: res.client_secret,
    }

    elements.value = stripe.value.elements(options);

    const paymentElement = elements.value.create('payment');
    paymentElement.mount('#payment-element');
  }).catch(error => {
    console.error(error)
  })
}

const message = ref(null)
const handleSubmit = async (e) => {
  e.preventDefault();

  const { error } = await stripe.value.confirmPayment({
    elements: elements.value,
    redirect: "if_required"
  });

  if (error === undefined) {
    axios.post(PAYMENT_SUCCESS_API, {
      payment_intent_id: PAYMENT_INTENT_ID.value
    })
  } else {
    axios.post(PAYMENT_FAILURE_API, {
      payment_intent_id: PAYMENT_INTENT_ID.value,
      code: error.code,
      description: error.message,
    })
  }


  // Show Message of Payment Success or Failure
  message.value = error ? error.message : "Payment Successful";
}
</script>
