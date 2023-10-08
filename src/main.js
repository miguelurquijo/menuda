import { createApp } from 'vue'
import App from './App.vue'

import router from './router'


const app = createApp(App)
import gAuthPlugin from 'vue3-google-oauth2';


let gauthClientId = '347237759908-ldk22lfjpe5qre4mv9ej0nls7unvvbro.apps.googleusercontent.com';
app.use(gAuthPlugin, { 
    clientId: gauthClientId, 
    scope: 'email', 
    prompt: 'consent', 
    fetch_basic_profile: true, 
    plugin_name:'Cliente web 2 - menuda'
    });
app.use(router)
app.mount('#app')
