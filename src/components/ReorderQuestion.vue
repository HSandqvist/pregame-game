<template>
  <!-- Display the question text -->
  <p>{{ question.q }}</p>
  <!-- Container for the draggable answer options -->
  <div class="ordered-grid">
    <!-- Loop through the answers and create draggable elements for each -->
    <div 
      v-for="(a, k) in question.a" 
      v-bind:class="['answer', {wiggle: currentlyMoving === a}]"
      draggable="true"
      v-on:mousedown="prepareDrag(a)"
      v-on:dragstart="startDrag($event)" 
      v-on:dragenter="updatePosition($event, k)"
      v-on:dragend="drop"
      v-bind:key="a.text"
      v-bind:ref="a.text"
    >
      <!-- Display the answer text -->
      {{ a.text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReorderQuestion',
  data: function () {
    return {
      // Question object with text and a list of answers
      question: {
        q: "Reorder these animals according to height (smallest first)", // Question text
        a: [
          { order: 3, text: 'Cat' },
          { order: 1, text: 'Mouse' },
          { order: 2, text: 'Giraffe' },
          { order: 4, text: 'Tyrannosaurus Rex' },
          { order: 5, text: 'Tyrannosaurus Lexus' }
        ]
      },
      currentlyMoving: null // Tracks the item currently being dragged
    }
  },
  watch: {
    // Watcher to sort the answers array by their order property whenever the question object changes
    question: {
      immediate: true, // Run immediately when the component is initialized
      deep: true, // Watch for deep changes within the object
      handler: function () {
        this.question.a.sort((a, b) => a.order - b.order);
      }
    }
  },
  methods: {
    // Update the position of items when a draggable element enters another
    updatePosition: function (e, d) {
      if (this.currentlyMoving !== d) {
        for (let a of this.question.a) {
          if (e.target === this.$refs[a.text]) {
            let tempOrder = a.order; // Temporarily store the current order
            a.order = this.currentlyMoving.order; // Swap the orders
            this.currentlyMoving.order = tempOrder;
            break;
          }
        }
      }
    },
    // Reset the currentlyMoving variable when the drag operation ends
    drop: function () {
      this.currentlyMoving = null;
    },
    // Set the currentlyMoving variable to the item being dragged
    prepareDrag: function (a) {
      this.currentlyMoving = a;
    },
    // Set a custom drag image (in this case, an invisible image)
    startDrag: function (e) {
      e.dataTransfer.setDragImage(new Image(), 0, 0);
    }
  }
}
</script>

<style scoped>
/* Style for the grid container */
.ordered-grid {
  display: grid;
  width: 30em;
  margin: auto;
}

/* Style for each draggable answer */
.answer {
  padding: 1em;
  border: 1px solid black;
}

/* Highlight the currently dragged item with a wiggle animation */
.wiggle {
  animation: wiggle 0.1s ease-in-out;
  animation-iteration-count: infinite;
  background-color: pink; /* Change background color for visual effect */
}

/* Define the wiggle animation keyframes */
@keyframes wiggle {
  0% { transform: rotate(0.5deg); }
  50% { transform: rotate(-0.5deg); }
  100% { transform: rotate(0.5deg); }
}
</style>
