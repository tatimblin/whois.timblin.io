<template>
  <main class="App">
    <aside class="App-sidebar">
      <user-profile></user-profile>
    </aside>
    <div class="App-content">
      <personal-info></personal-info>
      <my-sites></my-sites>
    </div>
  </main>
</template>

<script>
import UserProfile from './components/UserProfile.vue'
import PersonalInfo from './components/sections/PersonalInfo.vue'
import MySites from './components/sections/MySites.vue'

export default {
  name: 'app',
  components: {
    UserProfile,
    PersonalInfo,
    MySites,
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
