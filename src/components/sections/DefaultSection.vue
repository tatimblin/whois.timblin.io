<template>
  <content-container :title="title">

    <div
      class="Paragraph"
      :class="{ padding: needsDivider }"
      v-if="paragraphs && paragraphs.length"
    >
      <div class="Paragraph-item" v-for="item in paragraphs" :key="item.title || item.body">
        <h3 class="Paragraph-title Heading--brow" v-if="item.title">{{ item.title }}</h3>
        <p class="Paragraph-body">{{ item.body }}</p>
      </div>
    </div>

    <ul class="Bullet" v-if="bullets && bullets.length">
      <li class="Bullet-item" v-for="item in bullets" :key="item.label">
        <span class="Bullet-label Heading--brow">
          {{ item.label }}:
        </span>
        <ul class="Bullet-values" v-if="valueIsArray(item.value)">
          <li class="Bullet-value" v-for="value in item.value" :key="value">
            {{ value }}
          </li>
        </ul>
        <span class="Bullet-value" v-else>
          {{ item.value }}
        </span>
      </li>
    </ul>

  </content-container>
</template>

<script>
import ContentContainer from '@/components/ContentContainer.vue';

export default {
  components: {
    ContentContainer,
  },
  props: {
    title: String,
    paragraphs: Array,
    bullets: Array,
  },
  methods: {
    valueIsArray(value) {
      return Array.isArray(value);
    },
  },
  computed: {
    needsDivider() {
      return this.paragraphs && this.bullets;
    },
  },
};
</script>

<style lang="scss" scoped>
.Paragraph {
  &-item:not(:last-child)
  {
    margin-bottom: $spacing / 2;
  }
}

.padding {
  margin-bottom: $spacing;
}

.Bullet
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
    line-height: 1.66em;
  }
}
</style>
