<template>
  <div class="App" data-view>
    <main class="App-content Text">
      <aside class="App-item">
        <user-profile></user-profile>
      </aside>
      <div class="App-item" v-if="post">
        <router-link class="App-nav" to="/txt">Back to txt</router-link>
        <article class="BlogPost">
          <header class="BlogPost-header">
            <h1 class="BlogPost-title Heading--lead">{{ post.title }}</h1>
            <time class="BlogPost-date" :datetime="post.date">{{ formatDate(post.date) }}</time>
            <ul class="BlogPost-tags" v-if="post.tags && post.tags.length">
              <li class="BlogPost-tag" v-for="tag in post.tags" :key="tag">{{ tag }}</li>
            </ul>
          </header>
          <div class="BlogPost-body" v-html="post.html"></div>
        </article>
      </div>
      <div class="App-item" v-else>
        <router-link class="App-nav" to="/txt">Back to txt</router-link>
        <content-container title="Not Found">
          <p>Post not found.</p>
        </content-container>
      </div>
    </main>
  </div>
</template>

<script>
import UserProfile from '../components/UserProfile.vue';
import ContentContainer from '../components/ContentContainer.vue';
import posts from '../txt-posts';

export default {
  name: 'txt-post',
  components: {
    UserProfile,
    ContentContainer,
  },
  computed: {
    post() {
      return posts.find(p => p.slug === this.$route.params.slug);
    },
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(`${dateStr}T00:00:00`);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  metaInfo() {
    if (!this.post) {
      return { title: 'Post Not Found' };
    }
    const post = this.post;
    const imageAlt = post.imageAlt || post.title;
    const url = `https://tristantimblin.dev/txt/${post.slug}`;

    const meta = [
      { name: 'description', content: post.excerpt },
      { name: 'keywords', content: post.tags.join(', ') },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:title', content: post.title },
      { property: 'og:description', content: post.excerpt },
      { property: 'article:published_time', content: post.date },
      { property: 'article:author', content: 'Tristan Timblin' },
      ...post.tags.map(tag => ({ property: 'article:tag', content: tag })),
      { name: 'twitter:title', content: post.title },
      { name: 'twitter:description', content: post.excerpt },
    ];

    if (post.modified) {
      meta.push({ property: 'article:modified_time', content: post.modified });
    }

    if (post.image) {
      meta.push(
        { property: 'og:image', content: post.image },
        { property: 'og:image:alt', content: imageAlt },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: post.image },
        { name: 'twitter:image:alt', content: imageAlt },
      );
    } else {
      meta.push({ name: 'twitter:card', content: 'summary' });
    }

    const link = [];
    if (post.canonical) {
      link.push({ rel: 'canonical', href: post.canonical });
    }

    return {
      title: post.title,
      meta,
      link,
    };
  },
};
</script>

<style lang="scss" scoped>
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

.BlogPost {
  @include l-section;
  @include border-container;

  &-header {
    padding: calc(#{$spacing} / 2);
    border-bottom: $border-default;
  }

  &-title {
    margin-bottom: unit(25);
  }

  &-date {
    display: block;
    font-size: 12px;
    color: $text-secondary;
  }

  &-tags {
    display: flex;
    flex-wrap: wrap;
    gap: unit(25);
    margin-top: unit(50);
  }

  &-tag {
    padding: 2px 8px;
    font-size: 11px;
    background-color: $pale-blue;
    border-radius: $border-radius;
    color: $text-secondary;
  }

  &-body {
    padding: calc(#{$spacing} / 2);
    line-height: 1.66em;

    ::v-deep h1,
    ::v-deep h2,
    ::v-deep h3,
    ::v-deep h4,
    ::v-deep h5,
    ::v-deep h6 {
      font-family: $font-heading;
      color: $text-primary;
      margin-top: $spacing;
      margin-bottom: calc(#{$spacing} / 4);
    }

    ::v-deep h1 { font-size: 24px; }
    ::v-deep h2 { font-size: 20px; }
    ::v-deep h3 { font-size: 18px; }
    ::v-deep h4 { font-size: 16px; }

    ::v-deep p {
      margin-bottom: calc(#{$spacing} / 2);
    }

    ::v-deep a {
      color: $link-site;
      text-decoration: underline;

      &:hover {
        text-decoration: none;
      }
    }

    ::v-deep code {
      font-family: $font-body;
      font-size: 13px;
      background-color: $pale-blue;
      padding: 2px 4px;
      border-radius: $border-radius;
    }

    ::v-deep pre {
      margin-bottom: calc(#{$spacing} / 2);
      padding: calc(#{$spacing} / 2);
      background-color: $gray90;
      color: $gray20;
      border-radius: $border-radius;
      overflow-x: auto;

      code {
        background: none;
        padding: 0;
        color: inherit;
      }
    }

    ::v-deep blockquote {
      margin-bottom: calc(#{$spacing} / 2);
      padding: calc(#{$spacing} / 4) calc(#{$spacing} / 2);
      border-left: 3px solid $gray30;
      color: $text-secondary;
    }

    ::v-deep ul,
    ::v-deep ol {
      margin-bottom: calc(#{$spacing} / 2);
      padding-left: $spacing;
    }

    ::v-deep ul {
      list-style: disc;
    }

    ::v-deep ol {
      list-style: decimal;
    }

    ::v-deep li {
      margin-bottom: calc(#{$spacing} / 4);
    }

    ::v-deep img {
      max-width: 100%;
      height: auto;
      border-radius: $border-radius;
    }

    ::v-deep hr {
      margin: $spacing 0;
      border: none;
      border-top: $border-default;
    }
  }
}
</style>
