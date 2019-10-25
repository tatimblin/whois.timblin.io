<template>
  <content-container title="Professional Bio">
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
          value: `I'm a User Interface Engineer with a strong UX design background, focused on creating user valued digital
          experiences. I closely follow web standards to create accessible semantic web applications that all humans and
          search engines love.`,
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
  }
}
</style>