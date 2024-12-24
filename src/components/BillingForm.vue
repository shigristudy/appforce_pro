<template>
  <div class="mt-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Billing Information</h2>
      <button 
        v-if="isValidated && !isEditing"
        @click="startEditing"
        class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit Details
      </button>
    </div>

    <!-- Read-only view -->
    <div v-if="isValidated && !isEditing" class="space-y-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-500">Contact Information</h3>
          <div class="mt-2 space-y-1">
            <p class="text-sm text-gray-900">{{ form.first_name }} {{ form.last_name }}</p>
            <p class="text-sm text-gray-900">{{ form.email }}</p>
            <p class="text-sm text-gray-900">{{ form.phone }}</p>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-500">Billing Address</h3>
          <div class="mt-2 space-y-1">
            <p class="text-sm text-gray-900">{{ form.address }}</p>
            <p v-if="form.address2" class="text-sm text-gray-900">{{ form.address2 }}</p>
            <p class="text-sm text-gray-900">{{ form.city }}, {{ form.state }} {{ form.postal_code }}</p>
            <p class="text-sm text-gray-900">{{ selectedCountry?.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit form -->
    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <!-- Updated grid layout for better mobile responsiveness -->
      <div class="grid grid-cols-1 gap-4">
        <!-- Personal Information Section -->
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">Personal Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input 
                v-model="form.first_name"
                type="text"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.first_name}"
              >
              <span class="text-red-500 text-xs mt-1" v-if="errors.first_name">{{ errors.first_name }}</span>
            </div>
            
            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input 
                v-model="form.last_name"
                type="text"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.last_name}"
              >
              <span class="text-red-500 text-xs mt-1" v-if="errors.last_name">{{ errors.last_name }}</span>
            </div>
          </div>

          <!-- Contact Details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                v-model="form.email"
                type="email"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.email}"
              >
              <span class="text-red-500 text-sm" v-if="errors.email">{{ errors.email }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input 
                v-model="form.phone"
                type="tel"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.phone}"
              >
              <span class="text-red-500 text-sm" v-if="errors.phone">{{ errors.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h3 class="font-medium text-gray-900">Address Details</h3>
          
          <!-- Country and State -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Country/Region *</label>
              <select 
                v-model="form.country"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.country}"
                @change="handleCountryChange"
              >
                <option value="">Select Country</option>
                <option v-for="country in countries" :key="country.code2" :value="country.code2">
                  {{ country.name }}
                </option>
              </select>
              <span class="text-red-500 text-sm" v-if="errors.country">{{ errors.country }}</span>
            </div>
            <div v-if="selectedCountry?.states?.length">
              <label class="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
              <select 
                v-model="form.state"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.state}"
              >
                <option value="">Select State</option>
                <option v-for="state in selectedCountry.states" :key="state.code" :value="state.code">
                  {{ state.name }}
                </option>
              </select>
              <span class="text-red-500 text-sm" v-if="errors.state">{{ errors.state }}</span>
            </div>
          </div>

          <!-- Street Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input 
              v-model="form.address"
              type="text"
              placeholder="House number and street name"
              class="w-full p-2 border rounded-md mb-2"
              :class="{'border-red-500': errors.address}"
            >
            <input 
              v-model="form.address2"
              type="text"
              placeholder="Apartment, suite, unit, etc. (optional)"
              class="w-full p-2 border rounded-md"
            >
            <span class="text-red-500 text-xs mt-1" v-if="errors.address">{{ errors.address }}</span>
          </div>

          <!-- City and Postal code -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Town/City *</label>
              <input 
                v-model="form.city"
                type="text"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.city}"
              >
              <span class="text-red-500 text-sm" v-if="errors.city">{{ errors.city }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postcode/ZIP *</label>
              <input 
                v-model="form.postal_code"
                type="text"
                class="w-full p-2 border rounded-md"
                :class="{'border-red-500': errors.postal_code}"
              >
              <span class="text-red-500 text-sm" v-if="errors.postal_code">{{ errors.postal_code }}</span>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h3 class="font-medium text-gray-900">Additional Information</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
            <textarea 
              v-model="form.notes"
              rows="3"
              class="w-full p-2 border rounded-md"
              placeholder="Notes about your order, e.g. special notes for delivery"
            ></textarea>
          </div>
        </div>
      </div>

      <button 
        type="submit"
        class="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Continue to Payment
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import countriesData from './../data/countries.json';

const emit = defineEmits(['update:billingInfo', 'formValidated']);
const isEditing = ref(false);
const isValidated = ref(false);

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  country: '',
  state: '',
  address: '',
  address2: '',
  city: '',
  postal_code: '',
  notes: ''
});

const errors = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  country: '',
  state: '',
  address: '',
  city: '',
  postal_code: ''
});

// Create sorted countries list
const countries = computed(() => {
  return countriesData.sort((a, b) => a.name.localeCompare(b.name));
});

const selectedCountry = computed(() => countries.value.find(country => country.code2 === form.country));

const handleCountryChange = () => {
  form.state = '';
  // Reset state when country changes
  if (selectedCountry.value?.states?.length === 0) {
    errors.state = '';
  }
};

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '');

  if (!form.first_name.trim()) {
    errors.first_name = 'First name is required';
    isValid = false;
  }

  if (!form.last_name.trim()) {
    errors.last_name = 'Last name is required';
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email';
    isValid = false;
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
    isValid = false;
  } else if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) {
    errors.phone = 'Please enter a valid phone number';
    isValid = false;
  }

  if (!form.country) {
    errors.country = 'Country is required';
    isValid = false;
  }

  if (!form.address.trim()) {
    errors.address = 'Address is required';
    isValid = false;
  }

  if (!form.city.trim()) {
    errors.city = 'City is required';
    isValid = false;
  }

  if (!form.postal_code.trim()) {
    errors.postal_code = 'Postcal code is required';
    isValid = false;
  }

  // Only validate state if country has states
  if (selectedCountry.value?.states?.length > 0 && !form.state) {
    errors.state = 'State/Province is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (validateForm()) {
    isValidated.value = true;
    isEditing.value = false;
    emit('update:billingInfo', { ...form });
    emit('formValidated', true);
  }
};

const startEditing = () => {
  isEditing.value = true;
};
</script>