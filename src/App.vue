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
@import url('https://fonts.googleapis.com/css2?family=Limelight&family=Truculenta:opsz,wght@12..72,100..900&display=swap');

/* Global font styles */
body {
  font-family: "Truculenta", sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(to right, rgb(210, 66, 133), purple);
  color: white;
}

/* Headings */
h1, h2 {
  font-family: "Limelight", cursive;
  color: white;
}

/* General text */
p, button, input, select {
  font-family: "Truculenta", sans-serif;
}
</style>
