<template>
  <section class="ContentContainer">
    <div class="ContentContainer-head">
      <h2 class="ContentContainer-title">
        {{ title }}
      </h2>
      <a :href="external" v-if="external" class="ContentContainer-external" target="_blank">
        {{ prettyExternal }}
      </a>
    </div>
    <div class="ContentContainer-content">
      <slot/>
    </div>
    <div class="ContentContainer-foot">
      <button class="ContentContainer-expand">
        More
      </button>
    </div>
  </section>
</template>

<script>
export default {
  props: ['title', 'external'],
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

  border: $border-section;

  &-head
  {
    display: flex;
    justify-content: space-between;
    padding: $spacing / 2;
    border-bottom: 1px dashed black;
  }

  &-expand
  {
    width: 100%;
    padding: $spacing / 2;
  }
}
</style>