import './assets/main.css';
import './assets/vars.css';

import { createApp } from 'vue';
import App from './App.vue';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

const app = createApp(App);

app.use(createVuetify({
    theme: {
        defaultTheme: 'dark',
    },
}));

app.mount('#app');
