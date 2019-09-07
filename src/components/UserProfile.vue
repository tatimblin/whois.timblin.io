<template>
  <section class="UserProfile">
    <div class="UserProfile-cover">
      <img src="" alt="" class="UserProfile-image">
    </div>
    <h1 class="UserProfile-title">
      <span class="UserProfile-name">Tristan Timblin</span>
      <span class="UserProfile-role">Software Engineer</span>
    </h1>
    <p class="UserProfile-bio">A bit about me</p>
    <a href="" class="UserProfile-cta">My homepage</a>
    <account-link></account-link>
  </section>
</template>

<script>
import AccountLink from './AccountLink.vue'

export default {
  components: {
    AccountLink,
  }
}
</script>