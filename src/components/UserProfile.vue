<template>
  <section class="UserProfile">
    <div class="UserProfile-cover">
      <img src="@/assets/img/profile-cohere.jpg" alt="Tristan Timblin" class="UserProfile-image">
    </div>
    <h1 class="UserProfile-title">
      <span class="UserProfile-name Heading Heading--lead" itemprop="name">Tristan Timblin&nbsp;</span>
      <span class="UserProfile-role Heading--flag" itemprop="jobTitle">Software Engineer</span>
    </h1>
    <p class="UserProfile-bio" itemprop="description">
      I'm a developer building middle-out cloud infrastructure at Amazon from San Francisco, CA
    </p>
    <a href="https://tristantimblin.dev/" class="UserProfile-cta Link Link--cta" itemprop="url">My homepage</a>
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
    width: 120px;
    margin-top: calc(#{$spacing} / 2);

    @include query (sm) {
      width: 100%;
      margin-top: 0;
    }
  }

  &-title
  {
    margin: calc(#{$spacing} / 2) 0 calc(#{$spacing} / 4);
  }

  &-role
  {
    display: block;
  }

  &-cta
  {
    @include border-container;

    display: block;
    margin: calc(#{$spacing} / 2) 0;
    background: $section-heading;

    &:hover
    {
      background: $pale-blue;
    }
  }
}
</style>
