<template>
  <div class="MusicPlayer">
    <a class="MusicPlayer-content" href="https://open.spotify.com/user/2rdu132h3xewzz4sjegc4j4pq">
      <spotify-player src="https://spotify-stream-player-j2yxapx3oa-uk.a.run.app" />
    </a>
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
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;

  &-content {
    @include border-container;

    display: block;
    padding: unit(25);
    background-color: $gray10;
    border-left: none;
    border-right: none;
    border-bottom: none;
    border-radius: 0;
    color: $gray60;
    text-decoration: none;

    &:hover {
      background-color: $pale-blue;
    }

    @include query (xs)
    {
      @include border-container;

      border-radius: 6px;
    }
  }

  @include query (xs)
  {
    bottom: unit(100);
    left: unit(50);
    width: 300px;
  }

  @include query (md)
  {
    left: unit(100);
  }
}
</style>
