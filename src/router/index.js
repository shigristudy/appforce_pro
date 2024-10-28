import { createRouter, createWebHistory } from "vue-router";
import stripe from "../views/Stripe.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: stripe,
    },
  ],
});

export default router;
