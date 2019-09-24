<template>
  <section class="MyApps">
    <h2 class="MyApps-title Heading--head">
      Recommended Apps and Services
    </h2>
    <ul class="MyApps-content">
      <li class="MyApps-item" v-for="interest in interests" :key="interest.title">
        <card-item
          :title="interest.title"
        >
        </card-item>
      </li>
    </ul>
  </section>
</template>

<script>
import CardItem from '@/components/CardItem'

export default {
  components: {
    CardItem,
  },
  data () {
    return {
      interests: [
        {
          title: 'Vue.js'
        },
        {
          title: 'Netlify'
        },
        {
          title: 'Firebase'
        },
        {
          title: 'Codepen'
        },
        {
          title: 'Codrops'
        },
        {
          title: 'Eleventy'
        },
        {
          title: 'Git Flow'
        },
        {
          title: 'Pull Panda'
        },
        {
          title: 'You Don\'t Know Javascript'
        },
      ],
    }
  },
}
</script>

<style lang="scss">
.MyApps
{
  @include l-section;

  &-title
  {
    margin-bottom: $spacing / 2;
  }

  &-content
  {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: $spacing / 2;

    @include query (sm)
    {
      grid-template-columns: repeat(4, 1fr);
      grid-gap: $spacing / 2 $spacing;
    }
  }
}
</style>