<script setup>
// Import RouterView from Vue Router
// RouterView is a built-in component that dynamically
// renders the component associated with the current route.

import { RouterView } from 'vue-router';

import InstructionButton from '@/components/InstructionButton.vue';

// Dynamiska instruktioner för varje vy
const instructionsMap = {
  '/': 'Välkommen till startsidan! Här kan du skapa eller gå med i ett spel.',
  '/create': 'På denna sida kan du skapa ett nytt spel genom att ange detaljer.',
  '/lobby': 'Detta är lobbyn. Vänta tills alla deltagare är redo innan du startar spelet.',
  '/poll': 'På denna sida kan du rösta på dina medspelare genom att dra och släppa deras avatarer.',
};

</script>

<template>

  <div class="app-wrapper">
    <InstructionButton :instructions="currentInstructions" />

  <!-- Animated stars -->
    <div class="star">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>

      <!-- Main content -->
      <div class="main-content">
      <RouterView />
    </div>
</div>
</template>

<style>
/* Add component-specific styles here if needed */
/* Currently, no styles are defined for this component */


/* Limelight font */

@import url('https://fonts.googleapis.com/css2?family=Limelight&family=Truculenta:opsz,wght@12..72,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100..900&family=Sriracha&display=swap');
/* Siracha - lite skriv-aktig men läsbar, användas till text i textfiler? */
@import url('https://fonts.googleapis.com/css2?family=Sriracha&display=swap');

.app-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: auto; /* Prevent scrollbars */
}

/* Global font styles */
body {
  font-family: "Truculenta", sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, rgb(102, 0, 153), rgb(210, 66, 133), rgb(102, 0, 153));
  color: white;
}
.star {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.star div{
 position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.8); /* Vit stjärna med transparens */
  clip-path: polygon(50% 0,79% 90%,2% 35%,98% 35%,21% 90%); 
}

.star div:nth-child(1){
  top: 12%;
  left:42%;
  animation: animate 10s linear infinite
}

.star div:nth-child(2){
  top: 70%;
  left:50%;
  animation: animate 7s linear infinite
}

.star div:nth-child(3){
  top: 17%;
  left:10%;
  animation: animate 9s linear infinite
}

.star div:nth-child(4){
  top: 20%;
  left:60%;
  animation: animate 10s linear infinite
}

.star div:nth-child(5){
  top: 67%;
  left:18%;
  animation: animate 6s linear infinite
}

.star div:nth-child(6){
  top: 80%;
  left:70%;
  animation: animate 12s linear infinite
}

.star div:nth-child(7){
  top: 60%;
  left:80%;
  animation: animate 15s linear infinite
}

.star div:nth-child(8){
  top: 32%;
  left:25%;
  animation: animate 16s linear infinite
}

.star div:nth-child(9){
  top: 90%;
  left:25%;
  animation: animate 9s linear infinite
}

.star div:nth-child(10){
  top: 20%;
  left:80%;
  animation: animate 5s linear infinite
}

.star div:nth-child(11){
  top: 90%;
  left:90%;
  animation: animate 7s linear infinite
}

.star div:nth-child(12){
  top: 89%;
  left:50%;
  animation: animate 13s linear infinite
}
/* Main content */
.main-content {
  position: relative;
  z-index: 1; /* Innehållet ligger framför stjärnorna */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
@keyframes animate{
  0%{
    transform: scale(0) translateY(0) rotate(0);
    opacity:1;
  }
  100%{
    transform: scale(1.3) translateY(-90px) rotate(360deg);
    opacity:0;
  }
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
