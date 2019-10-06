<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/sites">Sites</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
.App
{
  background-color: #fff8eb;

  &-content
  {
    @include l-container;

    display: grid;

    @include query (sm)
    {
      grid-template-columns: 1fr 3fr;
      grid-gap: $spacing;
    }
  }

  &-item
  {
    min-width: 0;
  }
}
</style>
