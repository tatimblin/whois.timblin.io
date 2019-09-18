<template>
  <content-container title="Work History" external="https://linkedin.com/in/tristan-timblin/">
    <ul class="WorkHistory">
      <li class="WorkHistory-item" v-for="job in jobs" :key="job.key">
        <job-item>
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
          role: 'Yext',
          duration: 'April 2019',
          description: 'Lorem ipsum dolor sit amit.',
          referral: 'https://google.com/',
        },
      ],
    }
  },
}
</script>

<style lang="scss">
.WorkHistory
{

}
</style>