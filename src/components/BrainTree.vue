<template>
  <div class="max-w-xl m-auto flex flex-col justify-center items-center border border-gray-300 p-2 rounded-md my-2">
    <div id="braintree-drop-in-container"></div>

    <button :disabled="!dropinInstance"
      class="bg-blue-500  text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 self-start" type="submit"
      @click="handlePayment">Pay Now</button>

    <div v-if="message" class="mt-2 text-center text-sm p-2 font-bold"
      :class="message.includes('Successful') ? 'text-green-500' : 'text-red-500'">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import dropin from "braintree-web-drop-in";
import { ref, onMounted } from "vue";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
console.log(BASE_URL);

const INITIATE_PAYMENT_API = `${BASE_URL}/braintree/initiate`;
const PROCESS_PAYMENT_API = `${BASE_URL}/braintree/process_payment`;
const PAYMENT_SUCCESS_API = `${BASE_URL}/braintree/complete`;
const PAYMENT_FAILURE_API = `${BASE_URL}/braintree/failure`;
const PAYMENT_INTENT_ID = ref(null);

const dropinInstance = ref(null);
const message = ref(null);

onMounted(async () => {
    const { data } = await axios.post(INITIATE_PAYMENT_API);
    initializeBraintreeDropin(data.clientToken);
});


const initializeBraintreeDropin = (clientToken) => {
  dropin.create(
    {
      authorization: clientToken,
      container: "#braintree-drop-in-container",
    },
    (error, instance) => {
      if (error) {
        console.error(error);
        return;
      }
      dropinInstance.value = instance;
    }
  );
};

const handlePayment = () => {
  if (dropinInstance.value) {
    dropinInstance.value.requestPaymentMethod((err, payload) => {
      if (err) {
        console.error("Payment method error:", err);
        message.value = "Payment method error. Please try again.";
        return;
      }

      axios
        .post(PROCESS_PAYMENT_API, { 
          nonce: payload.nonce,
          // client_token: 
        })
        .then((response) => {
          message.value = "Payment Successful!";
          PAYMENT_INTENT_ID.value= response.data
          axios.post(PAYMENT_SUCCESS_API, {
            payment_intent_id: PAYMENT_INTENT_ID.value
          })
        })
        .catch((error) => {
          message.value = "Payment failed. Please try again.";
          console.error("Payment error:", error);
          axios.post(PAYMENT_FAILURE_API, {
            payment_intent_id: PAYMENT_INTENT_ID.value
          })
        });
    });
  }
};


</script>
