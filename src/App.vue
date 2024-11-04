<script setup>
import {ref} from 'vue';
import Stripe from './components/Stripe.vue'
import BrainTree from './components/BrainTree.vue'

const method=ref('');
</script>

<template>
  <div class="flex justify-center py-10 items-center space-x-5">
    <button class="w-40 text-center py-2 bg-blue-600 rounded-md text-white text-lg" @click="method='stripe'">Stripe</button>
    <button class="w-40 text-center py-2 bg-blue-600 rounded-md text-white text-lg" @click="method='braintree'">Brain Tree</button>
  </div>
  <Stripe v-if="method=='stripe'" />
  <BrainTree v-if="method=='braintree'" />
</template>
