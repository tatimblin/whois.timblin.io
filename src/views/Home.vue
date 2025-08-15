<template>
  <div class="App" data-view>
    <main class="App-content Text" itemscope itemtype="http://schema.org/Person">
      <aside class="App-item">
        <user-profile></user-profile>
      </aside>
      <div class="App-item">
        <default-section v-bind="content.aboutMe" />
        <music-player />
        <my-sites></my-sites>
        <my-interests></my-interests>
        <work-history></work-history>
        <my-apps></my-apps>
        <all-sites limit="5"></all-sites>
        <default-section v-bind="content.personalInfo" />
        <default-section v-bind="content.serverInfo" />
      </div>
    </main>
  </div>
</template>

<script>
import DefaultSection from '../components/sections/DefaultSection.vue';
import MusicPlayer from '../components/MusicPlayer.vue';
import UserProfile from '../components/UserProfile.vue';
import MySites from '../components/sections/MySites.vue';
import MyInterests from '../components/sections/MyInterests.vue';
import WorkHistory from '../components/sections/WorkHistory.vue';
import MyApps from '../components/sections/MyApps.vue';
import AllSites from '../components/sections/AllSites.vue';
import content from '../content';

export default {
  name: 'app',
  components: {
    DefaultSection,
    MusicPlayer,
    UserProfile,
    MySites,
    MyInterests,
    WorkHistory,
    MyApps,
    AllSites,
  },
  data() {
    return { content };
  },
  metaInfo: {
    titleTemplate: '%s - Software Engineering Profile',
  },
};
</script>

<style lang="scss">
.App
{
  background-color: $color-bg;

  &-content
  {
    @include l-container;

    display: grid;

    @include query (sm)
    {
      grid-template-columns: 1fr 3fr;
      grid-gap: $spacing;
    }
  }

  &-item
  {
    min-width: 0;
  }
}
</style>
