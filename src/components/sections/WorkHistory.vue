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
          key: 4,
          title: 'Software Engineer',
          co: 'Amazon',
          duration: 'June 2024',
          description: `
            Building on-prem wifi network capabilities for AWS customers to run closer to their compute. Developed a language
            agnostic authentication client for all non-Java/Rust aws services. Supporting ECDSA cryptography and TLS handshake,
            halving the connection overhead.
          `,
          url: 'https://aws.amazon.com/iam/',
          image: 'amazon.png',
        },
        {
          key: 3,
          title: 'Senior Software Engineer',
          co: 'Fisker',
          duration: 'May 2023 • June 2024',
          description: `
            Engineered pre-training data pipeline and OTA update functionality for connected vehicles. Managed webhook connections
            to pull raw CAN bus signals (1.8M msgs/sec, 8TB/day) into training datasets with a real-time inference API for
            production scoring. Stateless architecture, horizontally scalable, bench marked at 283ms/100k messages per 10-core
            node.
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
            Created open-source tooling (SSG framework, CLI, and VSCode extension) in React / Deno to enable customers to self-serve
            a >$100M ARR product, responsible for generating 4.5M web pages and 5B page views annually.
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
            Created highly interactive web experiences for agency clients, winning three w3 awards for interaction design (2018).
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
