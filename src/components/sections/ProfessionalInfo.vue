<template>
  <content-container title="About Me">
    <ul class="ProfessionalInfo">
      <li class="ProfessionalInfo-item" v-for="item in items" :key="item.label">
        <h3 class="ProfessionalInfo-label Heading--brow" v-if="item.label">{{ item.label }}</h3>
        <p class="ProfessionalInfo-value" itemprop="disambiguatingDescription">{{ item.value }}</p>
      </li>
    </ul>
  </content-container>
</template>

<script>
import ContentContainer from '@/components/ContentContainer.vue'
import ListItem from '@/components/ListItem.vue'

export default {
  components: {
    ContentContainer,
    ListItem,
  },
  data () {
    return {
      items: [
        {
          value: `
            I work at Yext – we manage business data such as locations, reviews, and more – one of
            our products involves surfacing this data in crawlable web apps. Within that product
            team, I lead the development of our UI system. The basis of the project is to build
            common components by combing through w3.org and schema.org, to implement features
            that can be handled automatically or with simple configuration, and ingest data in
            accordance with our platform's schema. I really love this work of baking in best
            practices at the lowest common level to improve the entire team’s efficiency.`,
        },
      ],
    }
  },
}
</script>

<style lang="scss">
.ProfessionalInfo
{
  &-item
  {
    &:not(:last-child)
    {
      margin-bottom: $spacing / 4;
    }
  }
  &-label
  {
    display: inline;

    &::after
    {
      content: ':';
      margin-right: 5px;
    }
  }

  &-value
  {
    display: inline;
    line-height: 1.4em;
  }
}
</style>