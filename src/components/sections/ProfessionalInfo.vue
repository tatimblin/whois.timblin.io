<template>
  <content-container title="Biography">
    <ul class="ProfessionalInfo">
      <li class="ProfessionalInfo-item" v-for="item in items" :key="item.label">
        <h3 class="ProfessionalInfo-label Heading--brow" v-if="item.label">{{ item.label }}</h3>
        <p class="ProfessionalInfo-value" itemprop="about">{{ item.value }}</p>
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
            A software engineer focused on the human computer interaction between people, and the applications
            they use day to day. I believe in building smaller solutions to service the same user needs faster and cheaper.
            At Yext I help build and maintain the application, that generates our pages. Together our service hosts
            over a million generated pages which average +1.5 billion views a year, chances are you've alredy visited one.`,
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