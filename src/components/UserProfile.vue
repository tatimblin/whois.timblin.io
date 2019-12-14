<template>
  <section class="UserProfile">
    <div class="UserProfile-cover">
      <img src="@/assets/img/profile-cohere.jpg" alt="Tristan Timblin" class="UserProfile-image">
    </div>
    <h1 class="UserProfile-title">
      <span class="UserProfile-name Heading Heading--lead" itemprop="name">Tristan Timblin</span>
      <span class="UserProfile-role Heading--flag" itemprop="jobTitle">Software Engineer</span>
    </h1>
    <p class="UserProfile-bio">I'm a developer building pages at Yext.</p>
    <a href="https://timblin.io/" class="UserProfile-cta Link Link--cta" itemprop="url">My homepage</a>
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
    display: block;
    width: 100%;
  }

  &-title
  {
    margin: $spacing / 2 0 $spacing / 4;
  }

  &-role
  {
    display: block;
  }

  &-cta
  {
    @include border-container;

    display: block;
    margin: $spacing / 2 0;
    background: $section-heading;

    &:hover
    {
      background: $pale-blue;
    }
  }
}
</style>
