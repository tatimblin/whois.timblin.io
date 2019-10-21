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
import ContentContainer from '@/components/ContentContainer.vue'
import ListItem from '@/components/ListItem.vue'

export default {
  components: {
    ContentContainer,
    ListItem,
  },
  data () {
    return {
      sites: [
        {
          title: 'timblin.io',
          url: 'https://timblin.io/',
          icon: '🌎',
          desc: 'A Personal homepage, which mostly just links back to this site.',
        },
        {
          title: 'jpg.timblin.io',
          url: 'https://jpg.timblin.io/',
          icon: '📸',
          desc: 'Photography website',
        },
        {
          title: 'mp3.timblin.io',
          url: 'https://mp3.timblin.io/',
          icon: '🎸',
          desc: 'Music stats website',
        },
      ]
    }
  },
}
</script>

<style lang="scss">
.MySites
{
  padding-top: $spacing / 4;

  &-item
  {
    @include l-list;
  }
}

</style>