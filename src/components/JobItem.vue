<template>
  <article class="JobItem" itemscope :itemtype="'https://schema.org/' + (index == 0 ? 'Occupation' : 'Role')">
    <meta itemprop="occupationalCategory" :value="data.jobCode">
    <div class="JobItem-media">
      <a :href="data.url" class="JobTitle-link" target="_blank">
        <img class="JobItem-image" :src="getImage(data.image)" :alt="data.co" itemprop="image">
      </a>
    </div>
    <div class="JobItem-content">
      <a :href="data.url" class="JobTitle-link Link" target="_blank" itemprop="url">
        <h4 class="JobItem-title Heading--sub" itemprop="name">{{ data.title }}</h4>
      </a>
      <h3 class="JobItem-co Heading--flag">{{ data.co }}</h3>
      <span class="JobItem-duration Heading--brow">
        <time class="JobItem-date">{{ data.duration }}</time>
        <span class="JobItem-status" v-if="index == 0">Current</span>
      </span>
      <p class="JobItem-desc" itemprop="description">{{ data.description }}</p>
      <a :href="data.referral" class="JobItem-referral Link" v-if="index == 0" itemprop="potentialAction">
        Want to work with me?
      </a>
    </div>
  </article>
</template>

<script>
export default {
  props: ['data', 'index'],
  methods: {
    getImage (fileName) {
      return require('@/assets/img/' + fileName)
    },
  },
}
</script>

<style lang="scss" scoped>
.JobItem
{
  display: grid;
  grid-template-columns: $spacing * 2 auto;
  grid-gap: $spacing / 2;

  &-image
  {
    width: 100%;
  }

  &-co
  {
    margin-top: 6px;
  }

  &-duration
  {
    display: block;
    margin-bottom: 6px;
  }

  &-status
  {
    &::before
    {
      content: '•';
      padding: 0 6px;
    }
  }

  &-referral
  {
    display: block;
    margin-top: $spacing / 4;
  }
}
</style>
