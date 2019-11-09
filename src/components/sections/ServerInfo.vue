<template>
  <content-container title="Site Information">
    <div class="SiteInfo-intro">
      <h3 class="SiteInfo-introTitle Heading--brow">{{ intro.title }}: </h3>
      <p class="SiteInfo-introBody">{{ intro.body }}</p>
    </div>
    <ul class="SiteInfo">
      <li class="SiteInfo-item" v-for="fact in facts" :key="fact.label">
        <span class="SiteInfo-label Heading--brow">
          {{ fact.label }}:
        </span>
        <ul class="SiteInfo-values" v-if="valueIsArray(fact.value)">
          <li class="SiteInfo-value" v-for="value in fact.value" :key="value">
            {{ value }}
          </li>
        </ul>
        <span class="SiteInfo-value" v-else>
          {{ fact.value }}
        </span>
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
      intro: {
        title: 'Site Purpose',
        body: `This site aims to be a source of truth for my internet presence. It keeps track of the sites I've been
        a part of, both for work and fun. It's also marked up as structured data for experimenting with indexing
        personal information.`,
      },
      facts: [
        {
          label: 'Version',
          value: '1.0.0'
        },
        {
          label: 'Domain',
          value: 'timblin.io'
        },
        {
          label: 'Host',
          value: 'Netlify'
        },
        {
          label: 'Registrar',
          value: 'Gandi SAS'
        },
        {
          label: 'Creation',
          value: '2018-07-14T20:22:57Z'
        },
        {
          label: 'Updated',
          value: '2019-06-10T21:58:30Z'
        },
      ]
    }
  },
  methods: {
    valueIsArray (value) {
      return Array.isArray(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.SiteInfo
{
  @include query (md)
  {
    columns: 2;
  }

  &-intro
  {
    margin-bottom: 8px;
  }

  &-item
  {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-gap: $spacing / 2;
    break-inside: avoid;

    @include query (xs)
    {
      grid-template-columns: 1fr 3fr;
    }

    @include query (sm)
    {
      grid-template-columns: 1fr 3fr;
    }

    @include query (md)
    {
      grid-template-columns: 1fr 2fr;
    }

    @include query (lg)
    {
      grid-template-columns: 1fr 3fr;
    }
  }
}
</style>