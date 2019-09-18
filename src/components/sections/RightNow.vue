<template>
  <content-container title="Right Now">
    <ul class="RightNow">
      <list-item></list-item>
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
}
</script>