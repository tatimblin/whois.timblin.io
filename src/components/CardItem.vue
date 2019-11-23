<template>
  <article class="CardItem">
    <img v-if="image" class="CardItem-image" :src="getImage(image)" :alt="title">
    <a v-if="url" :href="url" class="CardItem-cta" target="_blank" rel="noopener">
      <h3 class="CardItem-title Heading--sub Link">{{ title }}</h3>
    </a>
    <h3 v-else class="CardItem-title Heading--sub">{{ title }}</h3>
    <p v-if="desc" class="CardItem-desc">{{ desc }}</p>
  </article>
</template>

<script>
export default {
  props: ['image', 'title', 'desc', 'url'],
  methods: {
    getImage (fileName) {
      if (fileName) {
        return require('@/assets/img/' + fileName)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.CardItem
{
  @include border-container;

  height:100%;
  padding: $spacing / 2;
  box-sizing: border-box;

  &-image
  {
    height: 60px;
  }

  &-cta
  {
    &:hover
    {
      text-decoration: none;
    }
  }

  &-desc
  {
    margin-top: unit(50);
  }
}
</style>