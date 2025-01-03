<script setup>
// Import RouterView from Vue Router
// RouterView is a built-in component that dynamically
// renders the component associated with the current route.


/*
// Import the LanguageSwitcher component
import LanguageSwitcher from "./components/LanguageSwitcher.vue";

// Import the WebSocket library and initialize the socket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

import { ref } from "vue";

const lang = ref(localStorage.getItem("lang") || "en");

// Function to handle language change event
function handleLanguageChange(newLang) {
  lang.value = newLang;
  console.log("Language changed to:", newLang);

  //Update UI labels for the selected language
  localStorage.setItem('lang', newLang);
  socket.emit("getUILabels", newLang);
}
*/

import { RouterView } from "vue-router";




</script>

<template>
  <!-- Language Switcher placed at the top -->
  <!-- <LanguageSwitcher @language-changed="handleLanguageChange" /> -->

  <!-- RouterView is the placeholder for the current route's component -->
  <!-- When the route changes, this will automatically display the appropriate component -->
  <RouterView />
</template>

<style>
/* Add component-specific styles here if needed */
/* Currently, no styles are defined for this component */
/* Limelight font */
@import url("https://fonts.googleapis.com/css2?family=Limelight&family=Truculenta:opsz,wght@12..72,100..900&display=swap");

/* Laxend font - fet boxig stil*/
@import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100..900&family=Sriracha&display=swap');

/* Siracha - lite skriv-aktig men läsbar, användas till text i textfiler? */
@import url('https://fonts.googleapis.com/css2?family=Sriracha&display=swap');


/* Global font styles */
body {
  font-family: "Truculenta", sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(to right, rgb(210, 66, 133), purple);
  color: white;
}

/* Headings */
h1 {
  font-family: "Limelight", cursive;
  color: white;
}

h2 {
  font-family: "Lexend Deca", sans-serif;
  color: white;
}

/* General text */
p,
button,
input,
select {
  font-family: "Truculenta", sans-serif;
}
</style>
