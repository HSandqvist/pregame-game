// Import necessary functions from Vue Router for creating a router and history
import { createRouter, createWebHistory } from 'vue-router'
// Import the StartView component for the root path
import StartView from '../views/StartView.vue'

// Create a router instance and configure it
const router = createRouter({
  // Use the HTML5 history mode for navigation (removes hash from URLs)
  history: createWebHistory(import.meta.env.BASE_URL),
  // Define the application routes
  routes: [
    {
      // Root path ('/') mapping to the StartView component
      path: '/',
      name: 'Start',
      component: StartView
    },
    {
      //add userId
      // Dynamic route for viewing a poll, with an `id` parameter
      path: '/poll/:id/:userId',  //specified user path
      name: 'PollView',
      // Lazy-load the PollView component to improve performance
      component: () => import('../views/PollView.vue')
    },
    {
      // Dynamic route for accessing a lobby, with an `id` parameter
      path: '/lobby/:id',
      name: 'LobbyView',
      // Lazy-load the LobbyView component
      component: () => import('../views/LobbyView.vue')
    },
    {
      // Route for creating a new poll or quiz
      path: '/create/',
      name: 'CreateView',
      // Lazy-load the CreateView component
      component: () => import('../views/CreateView.vue')
    },
    {
      // Dynamic route for viewing poll results, with an `id` parameter
      path: '/result/:id',
      name: 'ResultView',
      // Lazy-load the ResultView component
      component: () => import('../views/ResultView.vue')
    }
  ]
})

// Export the router instance so it can be used in the main application
export default router

