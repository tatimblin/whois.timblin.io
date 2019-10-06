<template>
  <div class="ListItem">
    <div class="ListItem-icon">
      {{ icon }}
    </div>
    <h4 class="ListItem-title">
      <a :href="url"
         class="ListItem-link Link--nav"
         :target="newTab ? '_blank' : '_self'"
         :rel="noreferrer ? 'no-referrer' : ''">
        {{ title }}
      </a>
    </h4>
    <p class="ListItem-desc">
      {{ desc }}
    </p>
  </div>
</template>

<script>
export default {
  props: ['icon', 'title', 'url', 'desc', 'newTab', 'noreferrer'],
}
</script>

<style lang="scss">
.ListItem
{
  display: grid;
  grid-template-columns: $spacing auto;
  grid-gap: 10px $gutter;

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