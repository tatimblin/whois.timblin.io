<template>
  <main class="App Text">
    <aside class="App-sidebar">
      <user-profile></user-profile>
    </aside>
    <div class="App-content">
      <right-now></right-now>
      <personal-info></personal-info>
      <my-sites></my-sites>
      <my-interests></my-interests>
      <work-history></work-history>
      <my-apps></my-apps>
      <all-sites></all-sites>
      <server-info></server-info>
    </div>
  </main>
</template>

<script>
import RightNow from './components/sections/RightNow.vue'
import UserProfile from './components/UserProfile.vue'
import PersonalInfo from './components/sections/PersonalInfo.vue'
import MySites from './components/sections/MySites.vue'
import MyInterests from './components/sections/MyInterests.vue'
import WorkHistory from './components/sections/WorkHistory.vue'
import MyApps from './components/sections/MyApps.vue'
import AllSites from './components/sections/AllSites.vue'
import ServerInfo from './components/sections/ServerInfo.vue'

export default {
  name: 'app',
  components: {
    RightNow,
    UserProfile,
    PersonalInfo,
    MySites,
    MyInterests,
    WorkHistory,
    MyApps,
    AllSites,
    ServerInfo,
  },
};
</script>

<style lang="scss">
.App
{
  @include l-container;

  display: grid;

  @include query (sm)
  {
    grid-template-columns: 1fr 3fr;
    grid-gap: $spacing;
  }
}
</style>
