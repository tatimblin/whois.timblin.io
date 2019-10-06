<template>
  <div class="App">
    <main class="App-content Text">
      <aside class="App-item">
        <user-profile></user-profile>
      </aside>
      <div class="App-item">
        <my-sites></my-sites>
        <all-sites></all-sites>
      </div>
    </main>
  </div>
</template>

<script>
import UserProfile from '../components/UserProfile.vue'
import MySites from '../components/sections/MySites.vue'
import AllSites from '../components/sections/AllSites.vue'

export default {
  name: 'app',
  components: {
    UserProfile,
    MySites,
    AllSites,
  },
};
</script>

<style lang="scss">
.App
{
  background-color: #fff8eb;

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
