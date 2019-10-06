<template>
  <content-container title="Chronological Site List" :route="limit ? '/sites' : null">
    <ul class="AllSites">
      <li class="AllSites-group" v-for="year in years" :key="year">
        <h3 class="AllSites-title Heading--head" v-if="year != currentYear">{{ year }}</h3>
        <ul class="AllSites-list">
          <li class="AllSites-item" v-for="(site, i) in sortByYear(year)" :key="i">
            <list-item
              :icon="site.icon"
              :title="site.title"
              :url="site.url"
              :desc="site.desc"
              newTab="true"
              noreferrer="true"
            >
            </list-item>
          </li>
        </ul>
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
  props: ['limit'],
  data () {
    return {
      count: 0,
      sites: [
        {
          title: 'Big Lots store locator',
          company: 'Yext',
          url: 'https://local.biglots.com/',
          icon: '🛒',
          year: 2019,
          desc: 'Personal homepage',
        },
        {
          title: 'JTB branch locator',
          company: 'Yext',
          url: 'https://branch.jtbbwt.com/',
          icon: '✈️',
          year: 2019,
          desc: 'Photography website',
        },
        {
          title: 'uCity Lawn activation',
          company: 'Cohere',
          url: 'https://ucity-lawn-website.netlify.com/',
          icon: '⛲️',
          year: 2019,
          desc: 'Bright and fun Vue application to share event information in the upcoming uCity Philadelphia community.',
        },
        {
          title: 'The Civic apartments',
          company: 'Cohere',
          url: 'https://ucity-lawn-website.netlify.com/',
          icon: '👨‍🎨',
          year: 2019,
          desc: 'The first site built with the Cultivate templating application. Staticly generated site, with a JAMstack backend (do a speed test!). Built with Mike Medoro, and design by Randi Bellamy.',
        },
        {
          title: 'Cultivate design system',
          company: 'Cohere',
          url: 'https://ucity-lawn-website.netlify.com/',
          icon: '⚙️',
          year: 2018,
          desc: 'The first site built with the Cultivate templating application. Staticly generated site, with a JAMstack backend (do a speed test!). Built with Mike Medoro, and design by Randi Bellamy.',
        },
        {
          title: 'Urban beer hall',
          company: 'Cohere',
          url: 'https://thepostphl.com/',
          icon: '🐴',
          year: 2018,
          desc: 'Single page Wordpress site pulling data in from parent brand using Wordpress API.',
        },
        {
          title: 'Giuseppe & Sons',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '👌🏼',
          year: 2018,
          desc: '',
        },
        {
          title: 'Interactive design manifesto',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '✒️',
          year: 2018,
          desc: '',
        },
        {
          title: 'Redevelopment effort in Brewerytown',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '🏗',
          year: 2018,
          desc: '',
        },
        {
          title: 'University of Pennsylvania business services portfolio',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '👩🏼‍🏫',
          year: 2018,
          desc: '',
        },
        {
          title: 'Historic munitions plant, turned business campus.',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '🏭',
          year: 2018,
          desc: '',
        },
        {
          title: 'UPenn graduate student living',
          company: '',
          url: 'https://.com/',
          icon: '👨🏽‍🎓',
          year: 2018,
          desc: '',
        },
        {
          title: 'Urban development portfolio',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '🏚',
          year: 2018,
          desc: '',
        },
        {
          title: 'Collaborative makerspace for creators',
          company: 'Cohere',
          url: 'https://nextfab.com/',
          icon: '👨🏼‍🏭',
          year: 2017,
          desc: 'Wordpress site led by Mike Medoro.',
        },
        {
          title: 'Double Knot sushimi bar',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '🍣',
          year: 2017,
          desc: '',
        },
        {
          title: 'Apartment community outside Baltimore',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '🏢',
          year: 2017,
          desc: '',
        },
        {
          title: 'Nonprofit organization for empowerment',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '👉🏼',
          year: 2017,
          desc: '',
        },
        {
          title: 'Economic development plan for Alexandria, VA',
          company: 'Cohere',
          url: 'https://.com/',
          icon: '💸',
          year: 2017,
          desc: '',
        },
        {
          title: 'Mad-lib style murder mystery game',
          company: 'Drexel University',
          url: 'https://.com/',
          icon: '🔪',
          year: 2016,
          desc: '',
        },
        {
          title: 'Ecommerce store for the nations first animal shelter',
          company: 'Drexel University',
          url: 'https://.com/',
          icon: '🐶',
          year: 2016,
          desc: '',
        },
      ]
    }
  },
  computed: {
    years () {
      const yearsList = [...new Set(this.sites.map(x => x.year))]
      console.log(yearsList[0])
      if (this.limit) {
        return yearsList.slice(0, 1)
      }
      return yearsList
    },
    currentYear () {
      return 2019
    }
  },
  methods: {
    sortByYear (year) {
      const filter = this.sites.filter(x => x.year === year)
      if (this.limit) {
        return filter.slice(0, this.limit)
      }
      return filter
    }
  },
}
</script>

<style lang="scss">
.AllSites
{
  margin-top: $spacing / 4;

  &-title
  {
    margin-bottom: $spacing / 1.5;
    padding-left: $spacing / 4;
    background-color: $gray20;
  }

  &-list
  {
    margin-bottom: $spacing / 2;
  }

  &-item
  {
    @include l-list;
  }
}

</style>