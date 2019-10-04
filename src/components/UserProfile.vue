<template>
  <section class="UserProfile">
    <div class="UserProfile-cover">
      <img src="@/assets/img/profile-cohere.jpg" alt="" class="UserProfile-image">
    </div>
    <h1 class="UserProfile-title">
      <span class="UserProfile-name Heading Heading--lead">Tristan Timblin</span>
      <span class="UserProfile-role Heading--flag">Software Engineer</span>
    </h1>
    <p class="UserProfile-bio">A bit about me</p>
    <a href="" class="UserProfile-cta Link--cta">My homepage</a>
    <account-link></account-link>
  </section>
</template>

<script>
import AccountLink from './AccountLink.vue';

export default {
  components: {
    AccountLink,
  },
};
</script>

<style scoped lang="scss">
.UserProfile
{
  @include l-section;

  position: sticky;
  top: $spacing;
  margin-bottom: 0;

  &-image
  {
    display: block;
    width: 100%;
  }

  &-title
  {
    margin: $spacing / 4 0;
  }

  &-role
  {
    display: block;
  }

  &-cta
  {
    display: block;
    margin: $spacing / 2 0;
  }
}
</style>
