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
import ContentContainer from '@/components/ContentContainer.vue';
import ListItem from '@/components/ListItem.vue';

export default {
  components: {
    ContentContainer,
    ListItem,
  },
  props: ['limit'],
  data() {
    return {
      count: 0,
      sites: [
        {
          title: 'Credentials Manager VS Code Extension',
          company: 'Yext',
          url: 'https://github.com/tatimblin/vscode-yext',
          icon: '🔑',
          year: 2023,
          desc: `
            Created a VS Code extension to manage your active credentials and set defaults per repository.
          `,
        },
        {
          title: 'Retroactive New Tab Chrome Extension',
          company: 'Personal',
          url: 'https://chrome.google.com/webstore/detail/retroactive-new-tab/meofdjdpoiljkedjjmbedcdcaolhnbba',
          icon: '🧩',
          year: 2023,
          desc: `
            A small quality of life Chrome extension to take you back a page and open the current page in a new tab.
          `,
        },
        {
          title: 'React Component Library',
          company: 'Yext',
          url: 'https://github.com/yext/react-components',
          icon: '⚛️',
          year: 2022,
          desc: `
            Created a component library to handle rendering Yext platform specific datatypes, like Hours or Address.
          `,
        },
        {
          title: 'Unified Type library',
          company: 'Yext',
          url: 'https://github.com/yext/types',
          icon: '🔏',
          year: 2022,
          desc: `
            Created a single source of truth for API response types, to reduce duplicated implementation as several projects and teams adopted Typescript.
          `,
        },
        {
          title: 'Pages JS',
          company: 'Yext',
          url: 'https://github.com/yext/pages',
          icon: '🖨',
          year: 2022,
          desc: `
            A static site generator for hydrating React templates with Yext platform data, writted in Typescript and packaged as a Vite plugin.
          `,
        },
        {
          title: 'Rover + Petco',
          company: 'Yext',
          url: 'https://stores.petco.com/al/birmingham/rover-birmingham-al-1835.html',
          icon: '🐶',
          year: 2022,
          desc: `
            Deep integration of Rover bookings app on Petco.com.
          `,
        },
        {
          title: 'Custom Truck',
          company: 'Yext',
          url: 'https://www.customtruck.com/locations/cabot',
          icon: '🚧',
          year: 2022,
          desc: `
            Yext Pages implementation for a truck rental company.
          `,
        },
        {
          title: 'Grease Monkey',
          company: 'Yext',
          url: 'https://www.greasemonkeyauto.com/locations/us/al/phenix-city/1304-u.s.-280-bypass',
          icon: '🛻',
          year: 2022,
          desc: `
            Multi-brand Yext Pages implementation for Grease Monkey and SpeeDee brands.
          `,
        },
        {
          title: 'ball sort game',
          company: 'Personal',
          url: 'https://tatimblin.github.io/ball-sort-game/',
          icon: '🧮',
          year: 2022,
          desc: `
            A fun puzzle game where you try and sort colored cubes in a stack.
            I created this to learn React and the HTML Drag and Drop API.
          `,
        },
        {
          title: 'Armani',
          company: 'Yext',
          url: 'https://locations.armani.com/search?q=paris&qp=paris&l=en',
          icon: '👔',
          year: 2022,
          desc: `
            Yext Pages implementation for an Italian luxury fashion house.
          `,
        },
        {
          title: 'Clara Weisman – Fashion Portfolio',
          company: 'Personal',
          url: 'https://www.claraweisman.com/',
          icon: '👗',
          year: 2022,
          desc: `
            A fork of my photography website that I connected to a Contentful account for
            my friend Clara, who's an amazing designer. Bonus I'm wearing her clothes in
            one of the collections.
          `,
        },
        {
          title: 'Burger King UK',
          company: 'Yext',
          url: 'https://locations.burgerking.co.uk/london/117-kingsway',
          icon: '🤴🏻',
          year: 2022,
          desc: `
            Yext Pages implementation for an American fast food staple in the UK.
          `,
        },
        {
          title: 'Dignity Funerals Microsites',
          company: 'Yext',
          url: 'https://www.rdaviesfunerals.co.uk/',
          icon: '🧟‍♂️',
          year: 2022,
          desc: `
            A customizable microsite Dignity can provide to each of it's franchise owners. Replacing the former consolidated
            website which only offered each location a standard page.
          `,
        },
        {
          title: 'IQOS Search Experience',
          company: 'Yext',
          url: 'https://ch.iqos.com/en/searchresults?gr=false',
          icon: '💨',
          year: 2021,
          desc: 'A rich search experience with grouping, autocomplete, and pagination (NOTE: If country origin block go back)',
        },
        {
          title: 'Verizon – Cell Only',
          company: 'Yext',
          url: 'https://locations.cell-only.com/wy/jackson/365-w-broadway',
          icon: '📲',
          year: 2021,
          desc: 'A trial site for a client\'s subsidiary',
        },
        {
          title: 'Shutterfly',
          company: 'Yext',
          url: 'https://local.prestigeportraits.com/',
          icon: '🤳',
          year: 2021,
          desc: 'Help parents find their child\'s school photos by searching their school',
        },
        {
          title: 'JTB Travel Agent Search',
          company: 'Yext',
          url: 'https://consultants.jtb.co.jp/',
          icon: '🛩',
          year: 2021,
          desc: 'A search experience with advanced filtering like common wordpart facets to narrow down results',
        },
        {
          title: 'Bell & Ross Timepiece Store Locator',
          company: 'Yext',
          url: 'https://stores.bellross.com/france/paris-(75)/paris/25-rue-royale',
          icon: '⌚️',
          year: 2021,
          desc: 'Surface the nearest Bell & Ross store or retail partner location information in third party search applications',
        },
        {
          title: 'Subway Europe',
          company: 'Yext',
          url: 'https://restaurants.subway.com/',
          icon: '🥪',
          year: 2020,
          desc: `Added locale support across Europe and translations for 26 different languages
          for each Subway restaurant on the continent`,
        },
        {
          title: 'AT&T store locator',
          company: 'Yext',
          url: 'https://www.att.com/stores/',
          icon: '📲',
          year: 2020,
          desc: `A webpage for every AT&T store and major product (like the new iPhone) at each
          store. As well as a recurring job to keep a complex hierarchy of permissions (like
          branch, region, or corporate managers) up to date with proper user permissions`,
        },
        {
          title: 'Oakley store locator',
          company: 'Yext',
          url: 'https://stores.oakley.com/',
          icon: '😎',
          year: 2020,
          desc: 'Store locator for US and Canada locations.',
        },
        {
          title: 'Lenscrafters Store & Doctor locator',
          company: 'Yext',
          url: 'https://local.lenscrafters.com/',
          icon: '🤓',
          year: 2020,
          desc: 'Store and doctor locator for US and Canada locations.',
        },
        {
          title: 'PF Chang\'s restaurant locator',
          company: 'Yext',
          url: 'https://www.pfchangs.com/locations/us/va/mclean/1716m-international-dr/3000-tyson-s-corner.html',
          icon: '🥡',
          year: 2020,
          desc: 'Yext pages implementation for an asian-fusion restaurant in the United States.',
        },
        {
          title: 'ParkMobile venue parking',
          company: 'Yext',
          url: 'https://reserve.parkmobile.io/dc/washington/1500-south-capitol-st-se',
          icon: '🏟',
          year: 2020,
          desc: 'Help fans, concertgoers, and other guests looking online, find parking near ParkMobile supported venues.',
        },
        {
          title: 'Tuesday Morning intent pages',
          company: 'Yext',
          url: 'http://www.tuesdaymorning.com/stores/index.html',
          icon: '📆',
          year: 2019,
          desc: 'Department specific pages to increase SEO performance for customers looking for specific goods, near a Tuesday Morning location.',
        },
        {
          title: 'Church\'s Chicken restaurant locator',
          company: 'Yext',
          url: 'https://locations.churchs.com/la/baton-rouge/10785-florida-blvd',
          icon: '🍗',
          year: 2019,
          desc: 'Yext Pages implementation for a fried chicken chain in the United States.',
        },
        {
          title: 'Swiss Life Branch Finder',
          company: 'Yext',
          url: 'https://locations.swisslife.ch/de/zug',
          icon: '😇',
          year: 2019,
          desc: 'Branch finder for a Swiss insurance agency.',
        },
        {
          title: 'Big Lots store locator',
          company: 'Yext',
          url: 'https://local.biglots.com/',
          icon: '🛒',
          year: 2019,
          desc: 'Yext Pages implementation for a retail store in the United States.',
        },
        {
          title: 'JTB branch locator',
          company: 'Yext',
          url: 'https://branch.jtbbwt.com/',
          icon: '✈️',
          year: 2019,
          desc: 'Yext pages implementation for a Japanese travel agency.',
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
          url: 'https://www.thecivicphl.com/',
          icon: '👨‍🎨',
          year: 2019,
          desc: 'The first site built with the Cultivate templating application. Staticly generated site, with a JAMstack backend (do a speed test!). Built with Mike Medoro, and design by Randi Bellamy.',
        },
        {
          title: 'Cultivate design system',
          company: 'Cohere',
          url: 'https://cohere.city/the-civic/',
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
          desc: 'Single page Wordpress site pulling data in from its parent brand using Wordpress API.',
        },
        {
          title: 'Giuseppe & Sons',
          company: 'Cohere',
          url: 'https://giuseppesons.com/',
          icon: '👌🏼',
          year: 2018,
          desc: 'Restaurant theme built on Squarespace\'s developer platform, designed by Avery Sohn.',
        },
        {
          title: 'Interactive design manifesto',
          company: 'Cohere',
          url: 'http://design-manifesto.cohere.city/',
          icon: '✒️',
          year: 2018,
          desc: 'Interactive lead page, it accepts user signatures and displays them along with the architects manifesto, to design with purpose.',
        },
        {
          title: 'Redevelopment effort in Brewerytown',
          company: 'Cohere',
          url: 'https://otto-app.netlify.app/',
          icon: '🏗',
          year: 2018,
          desc: 'Vue.js application introducing one of the first developments in Brewerytown, Phildelphia.',
        },
        {
          title: 'University of Pennsylvania business services portfolio',
          company: 'Cohere',
          url: 'https://xd.adobe.com/view/fda0975c-0923-499d-6f40-0f7699615e9f-8b91/',
          icon: '👩🏼‍🏫',
          year: 2018,
          desc: 'UX prototype and wireframe of a new site promoting each of UPenn\'s divisions.',
        },
        {
          title: 'Historic munitions plant, turned business campus.',
          company: 'Cohere',
          url: 'http://arsenalphl.com/',
          icon: '🏭',
          year: 2018,
          desc: 'Animation heavy static site built Brendan Russo.',
        },
        {
          title: 'University of Pennsylvania graduate student living',
          company: '',
          url: 'http://www.lunaonpine.com/',
          icon: '👨🏽‍🎓',
          year: 2018,
          desc: '',
        },
        {
          title: 'Urban development portfolio',
          company: 'Cohere',
          url: 'http://www.metropolitanphilly.com/',
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
          url: 'https://www.eatyour.fish/',
          icon: '🍣',
          year: 2017,
          desc: '',
        },
        {
          title: 'Apartment community outside Baltimore',
          company: 'Cohere',
          url: 'https://dribbble.com/shots/4015448-Residential-Splash-Page',
          icon: '🏢',
          year: 2017,
          desc: '',
        },
        {
          title: 'Womens Way',
          company: 'Cohere',
          url: 'https://womensway.org/',
          icon: '👩🏻‍💼',
          year: 2017,
          desc: 'Nonprofit organization empowering people to take action and support equal opportunity efforts.',
        },
        {
          title: 'Economic development plan for Alexandria, VA',
          company: 'Cohere',
          url: 'https://growalx.com/',
          icon: '💸',
          year: 2017,
          desc: 'Contributed to the city of Alexandria\'s winning bid for the Amazon HQ2 competition.',
        },
        {
          title: 'Mad-lib style murder mystery game',
          company: 'Drexel University',
          url: 'https://tatimblin.github.io/murder-mystery/',
          icon: '🔪',
          year: 2016,
          desc: '',
        },
        {
          title: 'Ecommerce store for the nations first animal shelter',
          company: 'Drexel University',
          url: 'https://tatimblin.github.io/morris-jekyll/',
          icon: '🐶',
          year: 2016,
          desc: '',
        },
      ],
    };
  },
  computed: {
    years() {
      const yearsList = [...new Set(this.sites.map(x => x.year))];

      if (this.limit) {
        return yearsList.slice(0, 1);
      }
      return yearsList;
    },
    currentYear() {
      return new Date().getFullYear();
    },
  },
  methods: {
    sortByYear(year) {
      const filter = this.sites.filter(x => x.year === year);
      if (this.limit) {
        return filter.slice(0, this.limit);
      }
      return filter;
    },
  },
};
</script>

<style lang="scss">
.AllSites
{
  margin-top: calc(#{$spacing} / 4);

  &-title
  {
    margin-bottom: calc(#{$spacing} / 1.5);
    padding-left: calc(#{$spacing} / 4);
    background-color: $section-heading;
  }

  &-list
  {
    margin-bottom: calc(#{$spacing} / 2);
  }

  &-item
  {
    @include l-list;
  }
}
</style>
