import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import "../src/assets/main.css";

import "https://js.stripe.com/v3/";

const app = createApp(App);

app.mount("#app");
