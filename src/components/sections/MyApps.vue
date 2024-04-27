<template>
  <section class="MyApps">
    <h2 class="MyApps-title Heading--head">
      Recommended Apps and Services
    </h2>
    <ul class="MyApps-content">
      <li class="MyApps-item" v-for="interest in interests" :key="interest.title">
        <card-item
          :image="interest.image ? 'apps/' + interest.image : null"
          :title="interest.title"
          :url="interest.url"
        >
        </card-item>
      </li>
    </ul>
  </section>
</template>

<script>
import CardItem from '@/components/CardItem';

export default {
  components: {
    CardItem,
  },
  data() {
    return {
      interests: [
        {
          image: 'vue.png',
          title: 'Vue.js',
          url: 'https://vuejs.org/',
        },
        {
          image: 'netlify.png',
          title: 'Netlify',
          url: 'https://netlify.com/',
        },
        {
          image: 'faunadb.png',
          title: 'Fauna',
          url: 'https://fauna.com/',
        },
        {
          image: 'firebase.png',
          title: 'Firebase',
          url: 'https://firebase.google.com/docs/web/setup',
        },
        {
          image: 'vanilla-extract.svg',
          title: 'Vanilla Extract',
          url: 'https://vanilla-extract.style/',
        },
        {
          image: 'codepen.png',
          title: 'Codepen',
          url: 'https://codepen.io/',
        },
        {
          image: 'codrops.png',
          title: 'Codrops',
          url: 'https://tympanus.net/codrops/',
        },
        {
          image: '11ty.png',
          title: 'Eleventy',
          url: 'https://www.11ty.io/',
        },
        {
          image: 'git.png',
          title: 'Git Flow',
          url: 'https://github.com/nvie/gitflow',
        },
        {
          image: 'pullpanda.png',
          title: 'Pull Panda',
          url: 'https://pullreminders.com/',
        },
        {
          image: 'ydkjs.jpg',
          title: 'You Don\'t Know Javascript',
          url: 'https://github.com/getify/You-Dont-Know-JS',
        },
        {
          image: 'gyazo.png',
          title: 'Gyazo',
          url: 'https://gyazo.com',
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.MyApps
{
  @include l-section;

  &-title
  {
    margin-bottom: calc(#{$spacing} / 2);
  }

  &-content
  {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: calc(#{$spacing} / 2);

    @include query (sm)
    {
      grid-template-columns: repeat(3, 1fr);
    }

    @include query (md)
    {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>
