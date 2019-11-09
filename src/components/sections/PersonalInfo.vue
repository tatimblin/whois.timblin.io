<template>
  <content-container title="Personal Profile">
    <ul class="PersonalInfo">
      <li class="PersonalInfo-item" v-for="fact in facts" :key="fact.label">
        <span class="PersonalInfo-label Heading--brow">
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
          label: 'Origin',
          value: 'Virginia, US',
          schema: 'homeLocation'
        },
        {
          label: 'Birthday',
          value: 'June 11',
          schema: 'birthDate'
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
          value: 'I love to create things and be outside, summer is by far my favorite season.',
          schema: 'about'
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
  @include query (md)
  {
    columns: 2;
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

  &-values
  {
    line-height: 2em;
  }
}
</style>