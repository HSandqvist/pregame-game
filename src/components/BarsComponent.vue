<template>
  <div class="wrapper">
    <!-- Loop through each label in the labels array -->
    <div 
      class="bar" 
      v-for="(item, index) in labels" 
      v-bind:key="'a' + index"
    >
      <!-- Bar height is dynamically set based on the corresponding value in the data object -->
      <div v-bind:style="{ height: (data?.[item] || 0) + 'px' }">
        <!-- Display the numerical value inside the bar -->
        <span>{{ data?.[item] || 0 }}</span>
      </div>
      <!-- Display the label under the bar -->
      <div class="label">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BarsComponent',
  props: {
    labels: Array, // Array of labels to display under the bars
    data: Object   // Object with key-value pairs for bar heights
  }
}
</script>

<!-- Scoped CSS ensures styles are limited to this component -->
<style scoped>
/* Style for the numeric value displayed inside the bar */
span {
  color: var(--background-color);
}

/* Style for each bar */
.bar {
  display: inline-block;
  width: 50px;
  vertical-align: bottom;
}

/* Position the number above the bar */
.bar span {
  position: relative;
  top: -1.2em;
}

/* Base style for the bar */
.bar div {
  background-color: red;
}

/* Alternate bar colors based on position in the sequence */
.bar:nth-child(n) div:nth-child(1) {
  background-color: red;
}
.bar:nth-child(2n) div:nth-child(1) {
  background-color: blue;
}
.bar:nth-child(3n) div:nth-child(1) {
  background-color: teal;
}
.bar:nth-child(4n) div:nth-child(1) {
  background-color: purple;
}
.bar:nth-child(5n) div:nth-child(1) {
  background-color: yellow;
}

/* Style for the label under each bar */
.bar .label {
  background-color: white;
}

/* Wrapper for all bars, adds padding */
.wrapper {
  padding: 3em;
}
</style>
