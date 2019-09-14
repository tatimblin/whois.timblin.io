<template>
  <content-container title="Personal Information">
    <ul class="PersonalInfo">
      <li class="PersonalInfo-item" v-for="fact in facts" :key="fact.label">
        <span class="PersonalInfo-label">
          {{ fact.label }}:
        </span>
        <ul class="PersonalInfo-values" v-if="valueIsArray(fact.value)">
          <li class="PersonalInfo-value" :itemprop="fact.schema" v-for="value in fact.value" :key="value">
            {{ value }}
          </li>
        </ul>
        <span class="PersonalInfo-value" v-else :itemprop="fact.schema">
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
          label: 'Name',
          value: 'Tristan Timblin',
          schema: 'name'
        },
        {
          label: 'Nationality',
          value: 'Value',
          schema: 'nationality'
        },
        {
          label: 'Birthday',
          value: 'June 11',
          schema: 'test'
        },
        {
          label: 'Hobbies',
          value: ['Photography', 'Running', 'Drawing'],
          schema: 'test'
        },
        {
          label: 'Height',
          value: '6\'2"',
          schema: 'height'
        },
        {
          label: 'Weight',
          value: '190lbs',
          schema: 'weight'
        },
        {
          label: 'About',
          value: 'Lorem ipsum dolor sit amit.',
          schema: 'test'
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
.PersonalInfo
{
  padding: $spacing / 2;
  columns: 2;

  &-item
  {
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-gap: $spacing / 2;
    line-height: 2em;
    break-inside: avoid;
  }

  &-label
  {
    font-weight: $font-weight-bold;
  }
}
</style>