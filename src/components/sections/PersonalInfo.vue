<template>
  <content-container title="Personal Information">
    <ul class="PersonalInfo">
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