<template>
  <!-- Header section with navigation and branding -->
  <header>
    <!-- Hamburger menu for toggling navigation on smaller screens -->
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <!-- Logo section with images and branding text -->
    <div class="logo">
      <img src="/img/logo.png">
      Polly polling tool 
      <img src="../assets/logo.svg">
    </div>
  </header>
  <!-- Responsive navigation menu -->
  <ResponsiveNav v-bind:hideNav="hideNav">
    <!-- Button to switch the language -->
    <button v-on:click="switchLanguage">
      {{ uiLabels.changeLanguage }}
    </button>
    <!-- Link to create a new poll -->
    <router-link to="/create/">
      {{ uiLabels.createPoll }}
    </router-link>
    <!-- Links for additional information -->
    <a href="">
      {{ uiLabels.about }}
    </a>
    <a href="">FAQ</a>
  </ResponsiveNav>
  <!-- Main heading and subheading with labels -->
  <h1>{{ uiLabels["sales-pitch"] }}</h1>
  <h2>{{ uiLabels.subHeading }}</h2>
  <!-- Input for entering a poll ID -->
  <label>
    Write poll id: 
    <input type="text" v-model="newPollId">
  </label>
  <!-- Link to join the poll lobby -->
  <router-link v-bind:to="'/lobby/' + newPollId">
    {{ uiLabels.participatePoll }}
  </router-link>
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
// Initialize the WebSocket connection
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },
  data: function () {
    return {
      uiLabels: {},
      newPollId: "", // ID of the poll entered by the user
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true
    }
  },
  created: function () {
    // Listen for server updates to UI labels
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    // Request UI labels based on the current language
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    // Method to toggle between English and Swedish
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      // Save the language preference and request updated labels
      localStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    },
    // Method to toggle the navigation menu visibility
    toggleNav: function () {
      this.hideNav = ! this.hideNav;
    }
  }
}
</script>
<style scoped>
  header {
    background-color: gray;
    width: 100%;
    display: grid;
    grid-template-columns: 2em auto;
  }
  .logo {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 2.5rem;
    color: white;
    padding-top:0.2em;
  }
  .logo img {
    height:2.5rem;
    vertical-align: bottom;
    margin-right: 0.5rem; 
  }
  .hamburger {
    color:white;
    width:1em;
    display: flex;
    align-items: center;
    justify-content: left;
    padding:0.5rem;
    top:0;
    left:0;
    height: 2rem;
    cursor: pointer;
    font-size: 1.5rem;
  }

  /* Media query for responsive design on smaller screens */
@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hamburger::before {
    content: "☰";
  }
  .close::before {
    content: "✕";
  }
  .hide {
    left:-12em;
  }
}
</style>
