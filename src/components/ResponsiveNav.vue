<template>
  <!-- Navigation bar -->
  <nav v-bind:class="{'hide': hideNav}">
    <!-- Slot for dynamically injecting content into the navigation -->
    <slot>
    </slot>
  </nav>
</template>

<script>

export default {
  name: 'ResponsiveNav',
  props: {
      hideNav: Boolean // Boolean prop to control whether the navigation is hidden
  }
}
</script>
<style scoped>
  nav {
    background-color: lightgray;
    width:100%;
    height: 4em;
    display: grid;
    grid-template-columns: repeat(auto-fit, 10em);
  }

  nav ::v-slotted(a) {
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-decoration: none;
    color: gray;
    display: grid;
    align-items: center;
    justify-content: center;
    border-left: 1px solid gray;
  }

/* Media query for screens with a width of 50em or less */
@media screen and (max-width:50em) {
  nav {
    position: absolute;
    height:100vh;
    top: 3em;
    left: 0;
    width:12em;
    display: grid;
    grid-template-rows: repeat(auto-fit, 2em);
    transition: 0.5s;
  }
  /* Adjust slotted link styles for smaller screens */
  nav ::v-slotted(a) {
    justify-content: left;
    padding-left: 1em;
  }
  .hide {
    left:-12em;
  }
}
</style>
