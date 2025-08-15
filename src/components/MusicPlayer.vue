<template>
  <div class="MusicPlayer">
    <div class="MusicPlayer-content">
      <!-- <spotify-player src="http://localhost:8080" /> -->
      <spotify-player src="https://spotify-stream-player-j2yxapx3oa-uk.a.run.app" />
    </div>
  </div>
</template>

<script>
  import SpotifyPlayer from "@tristimb/spotify-stream-player";
  import "@tristimb/spotify-stream-player/dist/style.css"

  export default {
    name: "MusicPlayer",
    mounted: function() {
      this.$nextTick(function () {
        customElements.define("spotify-player", SpotifyPlayer);
      });
    },
  };
</script>

<style lang="scss" scoped>
  .MusicPlayer {
    &-content {
      @include border-container;

      padding: unit(25);
    }
  }
</style>
