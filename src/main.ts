import './assets/main.css';
import './assets/vars.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

const app = createApp(App);

app.use(createPinia());
app.use(createVuetify({
    theme: {
        defaultTheme: 'dark',
    },
}));

app.mount('#app');
