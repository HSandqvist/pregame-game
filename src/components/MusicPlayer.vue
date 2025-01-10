<template>
    <div class="music-player">
    <button @click="toggleMusic">
      <img
        :src="isMusicPlaying ? musicIconOn : musicIconOff"
        alt="Music Icon"
        class="music-icon"
      />
    </button>
    <audio ref="backgroundMusic" loop>
      <source :src="currentMusic" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div>
  </template>
  
  <script>
  import musicIconOn from "@/assets/img/musicIcon.png"; // Replace with your icon path
  import musicIconOff from "@/assets/img/musicIconOff.png"; // Replace with your icon path
  import lobbyviewMusic from "@/assets/lobbyviewMusic/lobbyviewMusic.mp3";
  import pollviewMusic from "@/assets/lobbyviewMusic/pollviewMusic.mp3";
  import resultviewMusic from "@/assets/lobbyviewMusic/resultviewMusic.mp3"
  
  export default {
    name: "MusicPlayer",
    props: {
      viewKey: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        isMusicPlaying: false,
        musicIconOn, // Active music icon
        musicIconOff, // Inactive music icon
        musicTracks: {
            LOBBYVIEW: lobbyviewMusic,
            POLLVIEW: pollviewMusic,
            RESULTVIEW: resultviewMusic,
          
        },
      };
    },
    computed: {
      currentMusic() {
        // Retrieve the correct music based on the viewKey
        return this.musicTracks[this.viewKey] || null; // Returnera rätt musik eller `null` om `viewKey` inte matchar
    },
    },
    methods: {
        toggleMusic() {
    const audio = this.$refs.backgroundMusic;

    if (!audio) {
      console.error("Audio element not found!");
      return;
    }

    if (this.isMusicPlaying) {
      audio.pause();
      this.isMusicPlaying = false;
    } else {
      if (this.currentMusic) {
        audio.currentTime = 0; // Återställ ljudet till början
        audio.play()
          .then(() => {
            this.isMusicPlaying = true;
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      } else {
        console.error("No music available for this viewKey.");
      }
    }
  },
    },
    watch: {
      // Watch for changes to the viewKey and reset the music
      viewKey() {
        const audio = this.$refs.audioElement;
        if (this.isMusicPlaying) {
          audio.pause();
          audio.load(); // Reload the new source
          audio.play();
        }
      },
    },
  };
  </script>
  
  <style scoped>
  
  .music-player {
    all:unset;
  position: fixed;
  top: 1rem;
  left: 4rem;
  z-index: 9999;
}

.music-player button {
  padding: 1px;
  background-color: rgb(252, 160, 198);  color: white;
  border: none;
  border-radius: 50%; /* Gör ikonen rund */
  cursor: pointer;
  display: flex; /* Använd flexbox för att centrera ikonen */
}

.music-icon {
  width: 40px;
  height: 40px;
  object-fit: cover;
  transition: filter 0.3s ease, transform 0.2s ease; /* Smidig övergång */
}

.music-player button:hover {
  background-color: rgb(255, 131, 203);
}

.music-icon:hover {
  transform: scale(1.1); /* Liten zoom vid hover */
}
  </style>
  