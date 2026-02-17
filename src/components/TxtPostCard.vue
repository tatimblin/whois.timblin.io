<template>
  <div class="ListItem">
    <div class="ListItem-icon">
      {{ post.icon || '📝' }}
    </div>
    <h4 class="ListItem-title">
      <router-link :to="`/txt/${post.slug}`" class="ListItem-link Link--nav">
        {{ post.title }}
      </router-link>
    </h4>
    <p class="ListItem-desc">
      {{ post.excerpt }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
};
</script>
