<template>
  <div class="flex flex-col items-center justify-center bg-white rounded-md shadow-lg border border-gray-200">
    <div
      class="p-8 text-center flex flex-col items-center justify-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64px"
        height="64px"
        viewBox="0 0 48 48"
        class="text-green-500"
      >
        <defs>
          <mask id="ipSCheckOne0">
            <g fill="none" stroke-linejoin="round" stroke-width="4">
              <path
                fill="#fff"
                stroke="#fff"
                d="M24 44a19.94 19.94 0 0 0 14.142-5.858A19.94 19.94 0 0 0 44 24a19.94 19.94 0 0 0-5.858-14.142A19.94 19.94 0 0 0 24 4A19.94 19.94 0 0 0 9.858 9.858A19.94 19.94 0 0 0 4 24a19.94 19.94 0 0 0 5.858 14.142A19.94 19.94 0 0 0 24 44Z"
              />
              <path stroke="#000" stroke-linecap="round" d="m16 24l6 6l12-12" />
            </g>
          </mask>
        </defs>
        <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSCheckOne0)" />
      </svg>
      <h1 class="text-3xl font-bold text-green-500 mb-2">Payment Successful</h1>
      <p class="text-lg text-gray-700 mb-4">
        Thank you for subscribing to Appforce Pro Lifetime License
      </p>
      <p>
        Invoice has been sent to your email
      </p>
      <!-- <a target="_blank" :href="invoiceLink" class="text-blue-500 font-semibold cursor-pointer hover:underline">Download invoice →</a> -->
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  device_id: String
});
const INVOICE_LINK = import.meta.env.VITE_INVOICE_LINK;
const invoiceLink = `${INVOICE_LINK}?device_id=${props.device_id}`
</script>