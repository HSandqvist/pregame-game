<template>
  <div>
    <div v-motion="slowPopEffect">
      <h2 v-motion="motionGlowText">
        {{ topAnswer }} {{ this.uiLabels.topAnswer || "got most votes" }} 
      </h2>

      <div>
        <img
          :src="topAvatar"
          alt="Participant Top Avatar"
          class="top-avatar-picture"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { motionGlowText, slowPopEffect } from "@/assets/motions.ts"; //Import motion settings

export default {
  name: "ResultQuestionComponent",
  props: {
    topAnswer: { type: String, default: "", required: true },
    maxVotes: { type: Number, default: 0, required: true },
    topAvatar: { type: String, default: "", required: true },
    uiLabels: { type: Object, default: () => ({})},   
    },

  data() {
    return {
      motionGlowText, // Motion settings
      slowPopEffect,
    };
  },
};
</script>

<style>
.top-avatar-picture {
  width: 200px;
  height: 200px;
  border-radius: 50%; /* Makes the avatars round */
  object-fit: cover; /* Ensures the image fills the container without distortion */
  border: 2px solid #ccc;
  cursor: grab;
  transition: transform 0.2s ease;
  -webkit-user-drag: none;
}
</style>
