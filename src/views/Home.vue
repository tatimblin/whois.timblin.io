<template>
  <div class="App" data-view>
    <main class="App-content Text" itemscope itemtype="http://schema.org/Person">
      <aside class="App-item">
        <user-profile></user-profile>
      </aside>
      <div class="App-item">
        <professional-info></professional-info>
        <personal-info></personal-info>
        <my-sites></my-sites>
        <my-interests></my-interests>
        <work-history></work-history>
        <my-apps></my-apps>
        <all-sites limit="5"></all-sites>
        <server-info></server-info>
      </div>
    </main>
  </div>
</template>

<script>
import ProfessionalInfo from '../components/sections/ProfessionalInfo.vue'
import UserProfile from '../components/UserProfile.vue'
import PersonalInfo from '../components/sections/PersonalInfo.vue'
import MySites from '../components/sections/MySites.vue'
import MyInterests from '../components/sections/MyInterests.vue'
import WorkHistory from '../components/sections/WorkHistory.vue'
import MyApps from '../components/sections/MyApps.vue'
import AllSites from '../components/sections/AllSites.vue'
import ServerInfo from '../components/sections/ServerInfo.vue'

export default {
  name: 'app',
  components: {
    ProfessionalInfo,
    UserProfile,
    PersonalInfo,
    MySites,
    MyInterests,
    WorkHistory,
    MyApps,
    AllSites,
    ServerInfo,
  },
  metaInfo: {
    titleTemplate: '%s - Software Engineering Profile'
  }
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
