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
import ContentContainer from '@/components/ContentContainer.vue';
import JobItem from '@/components/JobItem.vue';

export default {
  components: {
    ContentContainer,
    JobItem,
  },
  data() {
    return {
      jobs: [
        {
          key: 3,
          title: 'Senior Software Engineer',
          co: 'Fisker',
          duration: 'May 2023',
          description: `
            Developing cloud and data infrastructure for the capability of remote servicing vehicle components and
            delivering over-the-updates to cars.
          `,
          url: 'https://www.fiskerinc.com/',
          image: 'fisker.png',
        },
        {
          key: 2,
          title: 'Software Engineer',
          co: 'Yext',
          duration: 'April 2019 • February 2023',
          description: `
            Built full-stack search, NLP Q&A, and booking experiences for customers on the Yext platform by writing ETLs,
            REST/Streaming APIs, and web applications. I led initiatives to improve our internal tooling, and eventually
            offered them as open-source software to our clients to acheive a company goal of product-izing the Yext Pages
            service.
          `,
          referral: 'https://rolp.co/nVPMg',
          url: 'https://www.yext.com/',
          image: 'yext.png',
          jobCode: '15-1252.00',
        },
        {
          key: 1,
          title: 'Front End Developer',
          co: 'Cohere',
          duration: 'April 2017 • April 2019',
          description: `
            Established a design system, to reduce development time and standarize common code across the team. The
            component based system serves as a layer between web elements and company patterns.
          `,
          referral: 'https://cohere.city/careers',
          url: 'https://cohere.city/',
          image: 'cohere.png',
          jobCode: '15-1252.00',
        },
      ],
    };
  },
};
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
