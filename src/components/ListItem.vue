<template>
  <div class="ListItem">
    <div class="ListItem-icon">
      {{ icon }}
    </div>
    <h3 class="ListItem-title">
      <a :href="url" class="ListItem-link" target="_blank">
        {{ title }}
      </a>
    </h3>
    <p class="ListItem-desc">
      {{ desc }}
    </p>
  </div>
</template>

<script>
export default {
  props: ['icon', 'title', 'url', 'desc'],
}
</script>

<style lang="scss">
.ListItem
{
  display: grid;
  grid-template-columns: $spacing auto;
  grid-gap: 10px $gutter;
  padding: $spacing / 4 $spacing / 2;

  &:hover
  {
    background-color: #eee;
  }

  &-icon
  {
    font-size: $spacing;
  }

  &-title
  {
    grid-column-end: 3;
    grid-row-end: 2;
    align-self: end;
  }

  &-desc
  {
    grid-column-end: 3;
    grid-row-end: 3;
  }
}
</style>