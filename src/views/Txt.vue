<template>
  <div class="App" data-view>
    <main class="App-content Text">
      <aside class="App-item">
        <user-profile></user-profile>
      </aside>
      <div class="App-item">
        <router-link class="App-nav" to="/">Back</router-link>
        <content-container title="txt">
          <ul class="Txt">
            <li class="Txt-item" v-for="post in posts" :key="post.slug">
              <txt-post-card :post="post" />
            </li>
          </ul>
          <p v-if="!posts.length" class="Txt-empty">No posts yet.</p>
        </content-container>
      </div>
    </main>
  </div>
</template>

<script>
import UserProfile from '../components/UserProfile.vue';
import ContentContainer from '../components/ContentContainer.vue';
import TxtPostCard from '../components/TxtPostCard.vue';
import posts from '../txt-posts';

export default {
  name: 'txt',
  components: {
    UserProfile,
    ContentContainer,
    TxtPostCard,
  },
  data() {
    return { posts };
  },
  metaInfo: {
    titleTemplate: '%s - txt',
  },
};
</script>

<style lang="scss" scoped>
.Txt {
  padding-top: calc(#{$spacing} / 4);

  &-item {
    @include l-list;
  }
}

.Txt-empty {
  color: $text-secondary;
}

.App {
  &-nav {
    display: block;
    margin: 28px 0 8px;
    text-decoration: none;

    &::before {
      content: '\2B05';
      margin-right: 3px;
    }
  }
}
</style>
