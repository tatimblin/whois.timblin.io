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
import ContentContainer from '@/components/ContentContainer.vue';

export default {
  components: {
    ContentContainer,
  },
  data() {
    return {
      items: [
        {
          value: `
            I'm a software engineer focused on the human computer interaction between people, and the
            applications they use day to day. At Yext I help build and maintain the applications that
            generate our pages. Together our service hosts over a million static pages averaging
            +1.5 billion views a year (2018), chances are you've already visited one.`,
        },
      ],
    };
  },
};
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
