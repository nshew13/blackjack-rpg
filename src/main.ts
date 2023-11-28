import './assets/main.css';
import './assets/vars.css';

import { createApp } from 'vue';
import { Quasar } from 'quasar'
import App from './App.vue';

export const app = createApp(App);

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/dist/quasar.css'

app.use(Quasar, {
    plugins: {}, // import Quasar plugins and add here
})

app.mount('#app');
