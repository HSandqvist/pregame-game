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
      <p>{{ uiLabels.selectAnAvatar || "Avatars:" }}</p>

      <div class="avatar-scroll-container">
        <!-- Avatar Option List -->
        <div
          v-for="(avatarOption, index) in avatarOptions"
          :key="index"
          class="avatar-option"
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
import defaultAvatar from '@/assets/img/avatarsImg/Avatar1.png';
import avatar1 from '@/assets/img/avatarsImg/avatar1.png';
import avatar2 from '@/assets/img/avatarsImg/avatar2.png';
import avatar3 from '@/assets/img/avatarsImg/avatar3.png';
import avatar4 from '@/assets/img/avatarsImg/avatar4.png';
import avatar5 from '@/assets/img/avatarsImg/avatar5.png';
import avatar6 from '@/assets/img/avatarsImg/avatar6.png';
import avatar7 from '@/assets/img/avatarsImg/avatar7.png';
import avatar8 from '@/assets/img/avatarsImg/avatar8.png';

export default {
  props: {
    uiLabels: Object, // Language support for UI Labels
    isPictureTaken: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      chosenAvatar: defaultAvatar, 
      defaultAvatar,
      avatarOptions: [ avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8 ],
    };
  },
  methods: {
    selectAvatar(avatar) {
      this.chosenAvatar = avatar;
      this.$emit("update:avatar", avatar);
      this.$emit("update:isPictureTaken", true);
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
  padding: 20px;
  box-sizing: border-box;
}

.chosen-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-direction: column;
}

.chosen-avatar-picture {
  border: 0.1rem solid #f01984;
  border-radius: 50%;
  background-color: #f01984;
  width: 15rem;
  height: 14rem;
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
  border-radius: 1rem;
  min-width: 20%;
}

.avatar-options p {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  color: #f01984;
}

.avatar-scroll-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto; /* Enable vertical scrolling */
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

@media (max-width: 768px) {
  .choose-avatar-container {
    flex-direction: column; /* Stack items vertically on mobile */
    align-items: center;
  }

  .chosen-avatar {
    width: 80%; /* Adjust size on mobile */
    height: auto;
  }

  .avatar-options {
    width: 100%; /* Ensure options container takes full width on mobile */
    align-items: center;
  }

  .avatar-option img {
    width: 3rem;
    height: 3rem;
  }
}
</style>
