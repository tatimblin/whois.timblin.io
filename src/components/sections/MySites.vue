<template>
  <content-container title="My Sites">
    <ul class="MySites">
      <li class="MySites-item" v-for="site in sites" :key="site.url">
        <list-item
          :icon="site.icon"
          :title="site.title"
          :url="site.url"
          :desc="site.desc"
        >
        </list-item>
      </li>
    </ul>
  </content-container>
</template>

<script>
import ContentContainer from '@/components/ContentContainer.vue';
import ListItem from '@/components/ListItem.vue';

export default {
  components: {
    ContentContainer,
    ListItem,
  },
  data() {
    return {
      sites: [
        {
          title: 'jpg.tristantimblin.dev',
          url: 'https://jpg.tristantimblin.dev/',
          icon: '📸',
          desc: 'My photo gallery separated out into easily browsable collections, just keep scrolling.',
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.MySites
{
  padding-top: calc(#{$spacing} / 4);

  &-item
  {
    @include l-list;
  }
}

</style>
