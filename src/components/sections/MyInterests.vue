<template>
  <section class="MyInterests">
    <h2 class="MyInterests-title Heading--head">
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
          desc: `A web ideology that relies on javascript, API calls, and prerendered markup to move processing
          off the server. Sites built on the JamStack can be smaller, cheaper, and more performant applications.`,
        },
        {
          title: 'Web Components',
          desc: `A collection of web technologies that enable the creation of custom elements to encapsulate
          UI components on the shadow DOM. With web components custom interactions can be better abstracted
          and used throughout an application or across the organization.`,
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
    grid-template-columns: 1fr;
    grid-gap: $spacing / 2;

    @include query (sm)
    {
      grid-template-columns: repeat(2, 1fr);
      grid-gap: $spacing / 2 $spacing;
    }
  }
}
</style>