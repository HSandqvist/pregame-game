<template>
    <div v-if="message" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ message }}
    </div>
  </template>
  
  <script>
  export default {
    name: "ErrorMessage",
    props: {
      message: {
        type: String,
        required: false,
        default: "",
      },
    },
  };
  </script>
  
  <style scoped>
  .error-message {
    color: #ff4d4f; /* Softer red for a modern look */
    font-weight: bold;
    margin-top: 1rem;
    text-align: center;
    background-color: #ffecec; /* Light red background for emphasis */
    border: 1px solid #ff4d4f; /* Border matching the text color */
    border-radius: 8px; /* Rounded corners */
    padding: 10px 15px; /* Padding for better spacing */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    font-size: 1rem; /* Larger font size for readability */
    display: flex; /* Use flexbox for alignment */
    align-items: center; /* Vertically center content */
    justify-content: center; /* Horizontally center content */
    gap: 0.5rem; /* Space between icon and text */
  }
  
  .error-icon {
    font-size: 1.2rem; /* Slightly larger icon for emphasis */
  }
  </style>
  