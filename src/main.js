// Import the main CSS file for global styles
import './assets/main.css'

// Import the createApp function from Vue to create the root application instance
import { createApp } from 'vue'
// Import the root component of the application
import App from './App.vue'
// Import the router instance for handling application routing
import router from './router'

// Create the Vue application instance using the root component
const app = createApp(App)

// Install the router plugin to enable routing in the application
app.use(router)

// Mount the Vue application to the DOM element with the ID 'app'
// This is where the Vue app starts rendering
app.mount('#app')
