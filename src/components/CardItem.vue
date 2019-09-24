<template>
  <article class="CardItem">
    <h3 class="CardItem-title Heading--sub">{{ title }}</h3>
    <p class="CardItem-desc">{{ desc }}</p>
  </article>
</template>

<script>
export default {
  props: ['title', 'desc'],
}
</script>

<style lang="scss" scoped>
.CardItem
{
  padding: $spacing / 2;
  border: $border-section;
}
</style>