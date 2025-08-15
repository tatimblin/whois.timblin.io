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
          Built local network features into Wi-Fi access points to let customers connect on-prem compute directly to their AWS
          resources, skipping the public internet with IP-based routing. Refactored the auth client used by all non-Java AWS
          services, halving bearer token size and cutting TLS handshake roundtrips from two to one.
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
            Built cloud infrastructure for connected vehicles, from persistent webhooks for each car across a load balancer to
            event streams feeding distributed system consumers, processing 1.8M CAN bus messages per second (8 TB/day) to
            support ML-driven performance training and deliver over-the-air software updates.
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
            Developed open-source software and tooling to enable third-party developers to build and generate server-rendered
            web applications (+4.6B pages) on our platform.
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
