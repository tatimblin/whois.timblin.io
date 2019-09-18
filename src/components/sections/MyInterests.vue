<template>
  <section class="MyInterests">
    <h2 class="MyInterests-title">
      Interests
    </h2>
    <ul class="MyInterests-content">
      <li class="MyInterests-item" v-for="interest in interests" :key="interest.title">
        <card-item
          :title="interest.title"
          :desc="interest.desc"
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
          title: 'JAMStack',
          desc: 'Web ideology',
        },
        {
          title: 'Web Components',
          desc: 'Javascript framework',
        },
      ],
    }
  },
}
</script>

<style lang="scss">
.MyInterests
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
    grid-gap: $spacing / 2 $spacing;
  }
}
</style>