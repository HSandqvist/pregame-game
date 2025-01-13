<template>
  <div>
    <div v-if="!voting">
      <h1>{{ this.uiLabels.whichPlayer || "Which player?" }}</h1>

      <h2>{{ question.q }}</h2>

      <!-- Draggable answer options -->
      <div class="answer-options">
        <div
          v-for="(participant, index) in participants"
          :key="index"
          class="draggable"
          draggable="true"
          @dragstart="onDragStart(participant)"
          @touchstart="onTouch(participant)"
        >
          <div
            :class="
              draggedParticipant === participant
                ? 'participant-container-touched'
                : 'participant-container'
            "
          >
            <div class="curved-text">
              <span
                v-for="(char, i) in participant.name.split('')"
                :key="i"
                :style="getCurvedStyle(i, participant.name.length)"
              >
                {{ char }}
              </span>
            </div>
            <img
              :src="participant.avatar"
              alt="Participant Avatar"
              class="participant-avatar"
            />
          </div>
        </div>
      </div>

      <!-- Drop zone -->
      <div
        class="drop-zone"
        @dragover.prevent
        @drop="onDrop"
        @touchend="onDrop"
      >
        <div v-if="!touched">
          {{ this.uiLabels.dropAnswerHere || "Drop answer here" }}
        </div>
        <div v-if="touched">
          {{ this.uiLabels.clickHere || "Click your answer here" }}
        </div>
      </div>
    </div>

    <h2 id="waiting-answers-text" v-if="voting">
      <span
        v-for="(char, index) in textArray"
        :key="index"
        class="bouncing-char"
        :style="{ animationDelay: getDelay(index) + 's' }"
      >
        {{ char }}
      </span>
    </h2>
  </div>
</template>

<script>
export default {
  name: "QuestionComponent",
  props: {
    question: Object,
    participants: Array,
    voting: Boolean,
    uiLabels: { type: Object, default: () => ({}) },
  },
  emits: ["answer"], // Declare the custom event "answer" emitted by this component

  data() {
    return {
      draggedParticipant: null, // Temporarily holds the dragged participant
      touched: false,
    };
  },
  computed: {
    textArray() {
      // Split the text into an array of individual characters
      return (this.uiLabels.waitingForAnswers || "Waiting for answers..").split(
        ""
      );
    },
  },

  methods: {
    getDelay(index) {
      // Apply a wave effect delay to each character, making it look like a wave
      const waveDelay = Math.sin(index * 0.5) * 0.3; // Using sine for smooth wave pattern
      return waveDelay;
    },

    // When dragging starts, store the dragged participant
    onDragStart: function (participant) {
      this.draggedParticipant = participant;
    },

    onTouch: function (participant) {
      this.onDragStart(participant);
      this.touched = true;
    },

    // When an item is dropped in the drop zone
    onDrop: function () {
      if (this.draggedParticipant) {
        // Emit the dragged participant as the selected answer
        this.$emit("answer", this.draggedParticipant);
        this.touched = false;
        // Clear the temporary variable
        this.draggedParticipant = null;
      }
    },

    getCurvedStyle: function (index, length) {
      const angleStep = 9; // Adjust for curvature intensity
      const midpoint = length / 2;
      const rotationAngle = (index - midpoint) * angleStep;

      return {
        transform: `rotate(${rotationAngle}deg) translateY(-10px)`,
      };
    },
  },
};
</script>

<style>
/* Siracha - lite skriv-aktig men läsbar */
@import url("https://fonts.googleapis.com/css2?family=Sriracha&display=swap");

.participant-avatar {
  width: 7rem;
  height: 7rem;
  border-radius: 50%; /* Makes the avatars round */
  object-fit: cover; /* Ensures the image fills the container without distortion */
  border: 0.02rem solid rgb(252, 160, 198);
  cursor: grab;
  transition: transform 0.2s ease;
  -webkit-user-drag: none;
}

.participant-avatar:active {
  transform: scale(1.05); /* Slightly enlarge the avatar when dragging */
}

/* Draggable answer options */
.draggable {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem;
}

.drop-zone {
  width: 8rem;
  height: 8rem;
  border: 0.3rem dotted rgb(252, 160, 198);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem auto;
  background-color: rgba(252, 160, 198, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.draggable:active {
  cursor: grabbing;
  transform: scale(1);
}

/* Container for draggable items */
.answer-options {
  display: flex;
  flex-wrap: wrap; /* Allow items to wrap if they exceed container width */
  gap: 1rem; /* Space between items */
  justify-content: center;
  margin-bottom: 2rem;
}

/* Drop zone for answers */
.drop-zone:hover {
  background-color: rgba(252, 160, 198, 0.1);
  transform: scale(1.05);
}

.participant-container {
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: center; /* Center name and avatar horizontally */
}

.participant-container-touched {
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: center; /* Center name and avatar horizontally */
  transform: scale(1.2); /* Make the container a bit bigger */
}

.curved-text {
  display: flex;
  justify-content: center;
  transform: translateY(-0.05rem); /* Moves text above the avatar */
  position: relative;
}

.curved-text span {
  display: inline-block;
  transform-origin: bottom center;
  font-size: 1.1rem;
  font-weight: bold;
  color: rgb(249, 191, 215);
  letter-spacing: 0.05rem; /* Adjusts spacing between letters */
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2rem); /* Bounce upwards */
  }
  100% {
    transform: translateY(0);
  }
}

.bouncing-char {
  display: inline-block;
  animation: bounce 5s ease-in-out infinite; /* Apply bounce animation */
}

h2 span {
  display: inline-block;
  margin: 0 0.23rem; /* Small space between characters */
}

@media (max-width: 430px) {
  .participant-avatar {
    max-width: 5rem;
    max-height: 5rem;
  }
  .drop-zone {
    max-width: 6rem;
    max-height: 6rem;
  }

  .participant-avatar:active {
    transform: scale(1.01); /* Slightly enlarge the avatar when dragging */
  }

  .curved-text span {
    font-size: 0.7rem;
  }

  #waiting-answers-text {
    font-size: 0.9rem;
    min-width:21rem;
  }
}

@media (max-height: 750px) {
  .participant-avatar {
    max-width: 3.5rem;
    max-height: 3.5rem;
  }

  .curved-text span {
    font-size: 0.55rem;
  }
  .drop-zone {
    max-width: 5rem;
    max-height: 5rem;
  }
}
</style>
