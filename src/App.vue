<script setup>
// Import RouterView from Vue Router
// RouterView is a built-in component that dynamically
// renders the component associated with the current route.
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- RouterView is the placeholder for the current route's component -->
  <!-- When the route changes, this will automatically display the appropriate component -->
  <RouterView />
</template>

<style>
/* Add component-specific styles here if needed */
/* Currently, no styles are defined for this component */
</style>
