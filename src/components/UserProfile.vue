<template>
  <section class="UserProfile">
    <div class="UserProfile-cover">
      <img src="@/assets/img/profile-cohere.jpg" alt="" class="UserProfile-image">
    </div>
    <h1 class="UserProfile-title">
      <span class="UserProfile-name Heading Heading--lead">Tristan Timblin</span>
      <span class="UserProfile-role">Software Engineer</span>
    </h1>
    <p class="UserProfile-bio">A bit about me</p>
    <a href="" class="UserProfile-cta">My homepage</a>
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

  &-image
  {
    width: 100%;
  }

  &-name
  {
    @include Heading--lead;
  }

  &-role
  {
    @include Heading--brow;
  }

  &-cta
  {
    @include Link--cta;

    display: block;
    margin: $spacing / 2 0;
  }
}
</style>
