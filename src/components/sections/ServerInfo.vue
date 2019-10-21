<template>
  <content-container title="Server Information">
    <ul class="ServerInfo">
      <li class="ServerInfo-item" v-for="fact in facts" :key="fact.label">
        <span class="ServerInfo-label Heading--brow">
          {{ fact.label }}:
        </span>
        <ul class="ServerInfo-values" v-if="valueIsArray(fact.value)">
          <li class="ServerInfo-value" v-for="value in fact.value" :key="value">
            {{ value }}
          </li>
        </ul>
        <span class="ServerInfo-value" v-else>
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
.ServerInfo
{
  @include query (md)
  {
    columns: 2;
  }

  &-item
  {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-gap: $spacing / 2;
    line-height: 2em;
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