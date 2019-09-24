<template>
  <content-container title="Right Now">
    <ul class="RightNow">
      <li class="RightNow-item" v-for="item in items" :key="item.label">
        <h3 class="RightNow-label Heading--brow">{{ item.label }}</h3>
        <p class="RightNow-value">{{ item.value }}</p>
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
          label: 'At work',
          value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        },
        {
          label: 'Reading',
          value: 'Lorem ipsum',
        },
        {
          label: 'Listening To',
          value: 'Lorem ipsum',
        },
        {
          label: 'Watching',
          value: 'Lorem ipsum',
        },
      ],
    }
  },
}
</script>

<style lang="scss">
.RightNow
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