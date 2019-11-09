<template>
  <content-container title="Work History" external="https://linkedin.com/in/tristan-timblin/">
    <ul class="WorkHistory">
      <li class="WorkHistory-item" v-for="(job, index) in jobs" :key="job.key">
        <job-item :data="job" :index="index">
        </job-item>
      </li>
    </ul>
  </content-container>
</template>

<script>
import ContentContainer from '@/components/ContentContainer.vue'
import JobItem from '@/components/JobItem.vue'

export default {
  components: {
    ContentContainer,
    JobItem,
  },
  data () {
    return {
      jobs: [
        {
          key: 2,
          title: 'Front End Developer',
          co: 'Yext',
          duration: 'April 2019',
          description: `At Yext I build highly crawlable web applications, to help populate current business information
          throughout the web like in rich snippets. Our focus is to enable businesses to answer questions about themselves
          wherever a customer asks.`,
          referral: 'https://rolp.co/nVPMg',
          url: 'https://www.yext.com/',
          image: 'yext.png',
        },
        {
          key: 1,
          title: 'Front End Developer',
          co: 'Cohere',
          duration: 'April 2017 - April 2019',
          description: 'Established a design system, to reduce development time and standarize common code across the team. The component based system serves as a layer between web elements and company patterns.',
          referral: 'https://cohere.city/careers',
          url: 'https://cohere.city/',
          image: 'cohere.png',
        },
      ],
    }
  },
}
</script>

<style lang="scss">
.WorkHistory
{
  &-item
  {
    @include l-list;
  }
}
</style>