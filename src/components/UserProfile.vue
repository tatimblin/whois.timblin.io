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
      Building wireless and cloud network infrastructure at Amazon from San Francisco, CA.
    </p>
    <a href="https://tristantimblin.dev/" class="UserProfile-cta Link Link--cta" itemprop="url">My homepage</a>
    <account-link class="UserProfile-account"></account-link>
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

  // Mobile grid layout
  display: grid;
  grid-template-columns: 120px 1fr;
  grid-template-areas: 
    "cover title"
    "cover bio"
    "cta cta"
    "account account";
  gap: calc(#{$spacing} / 4);
  align-items: start;

  @include query (sm) {
    // Reset to default layout for tablet and larger
    display: block;
    grid-template-columns: none;
    grid-template-areas: none;
    gap: 0;
  }

  &:first-child {
    margin-top: calc(#{$spacing} / 2);
  }

  &-cover
  {
    grid-area: cover;

    @include query (sm) {
      grid-area: auto;
    }
  }

  &-image
  {
    display: block;
    width: 120px;
    margin-top: 0;

    @include query (sm) {
      width: 100%;
      margin-top: 0;
    }
  }

  &-title
  {
    grid-area: title;
    margin: 0 0 calc(#{$spacing} / 4);

    @include query (sm) {
      grid-area: auto;
      margin: calc(#{$spacing} / 2) 0 calc(#{$spacing} / 4);
    }
  }

  &-bio
  {
    grid-area: bio;
    margin: 0;

    @include query (sm) {
      grid-area: auto;
    }
  }

  &-role
  {
    display: block;
  }

  &-cta
  {
    @include border-container;

    grid-area: cta;
    display: block;
    margin: calc(#{$spacing} / 2) 0;
    background: $section-heading;

    @include query (sm) {
      grid-area: auto;
    }

    &:hover
    {
      background: $pale-blue;
    }
  }

  &-account {
    grid-area: account;
  }
}
</style>
