<template>
  <main class="App">
    <aside class="App-sidebar">
      <user-profile></user-profile>
    </aside>
    <div class="App-content">
      Main content
    </div>
  </main>
</template>

<script>
import UserProfile from './components/UserProfile.vue'

export default {
  name: 'app',
  components: {
    UserProfile,
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
  }
}
</style>
