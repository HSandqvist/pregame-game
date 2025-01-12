<template>
  <div class="choose-avatar-container">
    <!-- Chosen Avatar Display -->
    <div class="chosen-avatar">
      <h1>{{ uiLabels.chooseYourAvatar || "Choose Your Avatar" }}</h1>

      <div class="chosen-avatar-picture">
        <img :src="chosenAvatar" alt="Chosen Avatar" class="avatar-image" />
      </div>
    </div>

    <!-- Scrollable Avatar Options -->
    <div class="avatar-options">
      <div class="avatar-scroll-container">
        <!-- Avatar Option List -->
        <div
          v-for="avatarOption in avatarOptions"
          :key="avatarOption"
          class="avatar-option"
          :class="{ disabled: isAvatarTaken(avatarOption) }"
          @click="selectAvatar(avatarOption)"
        >
          <img
            :src="avatarOption || defaultAvatar"
            alt="Avatar Option"
            class="avatar-option-image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import defaultAvatar from "@/assets/img/avatarsImg/defaultAvatar.png";
import avatar1 from "@/assets/img/avatarsImg/avatar1.png";
import avatar2 from "@/assets/img/avatarsImg/avatar2.png";
import avatar3 from "@/assets/img/avatarsImg/avatar3.png";
import avatar4 from "@/assets/img/avatarsImg/avatar4.png";
import avatar5 from "@/assets/img/avatarsImg/avatar5.png";
import avatar6 from "@/assets/img/avatarsImg/avatar6.png";
import avatar7 from "@/assets/img/avatarsImg/avatar7.png";
import avatar8 from "@/assets/img/avatarsImg/avatar8.png";
import avatar9 from "@/assets/img/avatarsImg/avatar9.png";

export default {
  props: {
    uiLabels: Object, // Language support for UI Labels
    isPictureTaken: {
      type: Boolean,
      required: true,
    },
    takenAvatars: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      chosenAvatar: defaultAvatar,
      defaultAvatar,
      avatarOptions: [
        avatar1,
        avatar2,
        avatar3,
        avatar4,
        avatar5,
        avatar6,
        avatar7,
        avatar8,
        avatar9,
      ],
    };
  },
  methods: {
    selectAvatar(avatar) {
      console.log("avatarOptions", this.avatarOptions.length);
      console.log("takenAvatars", this.takenAvatars.length);

      if (!this.isAvatarTaken(avatar)) {
        this.chosenAvatar = avatar;
        //this.$emit("update:avatar", avatar);
        this.$emit("update:isPictureTaken", true);
        this.$emit("avatar-selected", avatar); // Notify parent component
      }
    },

    isAvatarTaken(avatar) {
      console.log("Checking if avatar is taken:", avatar);

      return this.takenAvatars.includes(avatar);
    },
  },
};
</script>

<style scoped>
.choose-avatar-container {
  display: flex;
  justify-content: space-between; /* Put elements in a row */
  align-items: flex-start; /* Align items at the top */
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.chosen-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.chosen-avatar-picture {
  border: 0.1rem solid #f01984;
  border-radius: 50%;
  background-color: #f01984;
  width: 15rem;
  height: 15rem;
}

.avatar-image {
  width: 100%; /* Make the image stretch to full width */
  height: 100%; /* Make the image stretch to full height */
  object-fit: cover; /* Ensure the image covers the area */
  border-radius: 50%;
  border: none;
}

.avatar-options {
  display: flex;
  flex-direction: column; /* Similar to camera buttons */
  gap: 1rem;
  align-items: center;
  background-color: #ffa0d0;
  border-radius: 3rem;
  height: 22rem;
  width: 5rem;
  max-width: 40%;
  padding: 1rem;
}

.avatar-scroll-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  overflow-y: auto; /* Enable vertical scrolling */
  padding: 2rem;
  width: 3rem;
}

.avatar-option {
  cursor: pointer;
  text-align: center;
}

.avatar-option img {
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  border-radius: 50%;
  border: 0.15rem solid #f01984;
  transition: transform 0.3s ease-in-out;
}

.avatar-option:hover img {
  cursor: pointer;
  transform: scale(1.04);
}

.avatar-option.disabled {
  position: relative;
  cursor: not-allowed;
}

.avatar-option.disabled img {
  opacity: 0.5;
  pointer-events: none;
  border-radius: 2rem;
  border-color: aliceblue;
}
.avatar-option.disabled img:hover {
  transform: none;
}

avatar-option.disabled::after {
  content: ""; /* Create a pseudo-element to add the overlay */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(
    255,
    255,
    255,
    0.6
  ); /* Semi-transparent white background */
  border-radius: 50%; /* Ensure the overlay matches the border-radius of the image */
  z-index: 100; /* Place the overlay above the image */
}

@media (max-width: 768px) {
  .choose-avatar-container {
    flex-direction: column; /* Stack items vertically on mobile */
    align-items: center;
    width: 100%;
  }

  .chosen-avatar {
    width: 80%; /* Adjust size on mobile */
    height: auto;
  }

  .avatar-options {
    width: 100%; /* Ensure options container takes full width on mobile */
    align-items: center;
    flex-direction: row;
    height: 6rem;
    max-height: 40%;
    gap: 1rem;
  }

  .avatar-option img {
    width: 4rem;
    height: 4rem;
  }

  .avatar-scroll-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 15px;
    overflow-x: auto; /* Enable vertical scrolling */
    padding: 0.3rem;
  }

  @media (max-height: 667px) {
    .choose-avatar-container {
      margin-top: 1.5rem;
      max-height: 40%;
    }
    .avatar-options {
      max-height: 3.5rem;
    }
  }
}
</style>
