<template>
  <section class="ContentContainer">
    <div class="ContentContainer-head">
      <h2 class="ContentContainer-title Heading--head">
        {{ title }}
      </h2>
      <a :href="external" v-if="external" class="ContentContainer-external" target="_blank">
        {{ prettyExternal }}
      </a>
    </div>
    <div class="ContentContainer-content">
      <slot/>
    </div>
    <router-link class="ContentContainer-expand" v-if="route" :to="route">
      View More
    </router-link>
  </section>
</template>

<script>
export default {
  props: ['title', 'external', 'route'],
  computed: {
    prettyExternal () {
      const url = this.external.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
      return url[1]
    }
  }
}
</script>

<style lang="scss">
.ContentContainer
{
  @include l-section;
  @include border-container;

  &-head
  {
    display: flex;
    justify-content: space-between;
    padding: calc(#{$spacing} / 3) calc(#{$spacing} / 2);
    border-bottom: $border-default;
    background: $section-heading;
  }

  &-external
  {
    @include Link--underline;
  }

  &-content
  {
    padding: calc(#{$spacing} / 2);
  }

  &-expand
  {
    display: block;
    padding: calc(#{$spacing} / 2);
    text-align: center;
    border-top: $border-default;
    background-color: $gray10;
    transition: $anim-default;

    &:hover
    {
      background-color: $pale-blue;
    }
  }
}
</style>