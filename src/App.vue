<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Tristan Timblin',
    htmlAttrs: {
      lang: 'en',
      amp: true
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'A User Interface Engineer with a strong UX design background, focused on creating user valued digital experiences.' },
      { name: 'theme-color', content: '#e1ecff' },
      { name: 'robots', content: 'index' },
      { name: 'googlebot', content: 'index' },
      { name: 'generator', content: 'vue' },
      { name: 'subject', content: 'Professional profile of software engineer Tristan Timblin' },
      { name: 'og:type', content: 'profile'},
      { name: 'og:profile:first_name', content: 'Tristan'},
      { name: 'og:profile:last_name', content: 'Timblin'},
      { name: 'og:title', content: 'Tristan Timblin - Software Engineer'},
      { name: 'og:image', content: '@/assets/img/profile-cohere.jpg'},
      { name: 'og:image:alt', content: 'Profile of Tristan Timblin'},
      { name: 'og:description', content: 'A User Interface Engineer with a strong UX design background, focused on creating user valued digital experiences.'},
      { name: 'os:site_name', content: 'whois.timblin.io'},
      { name: 'locale', content: 'en_US'},
      { name: 'article:author', content: 'Tristan Timblin'},
      { name: 'twitter:card', content: 'summary'},
      { name: 'twitter:site', content: '@TristanTimblin'},
      { name: 'twitter:creator', content: '@TristanTimblin'},
      { name: 'twitter:url', content: 'https://whois.timblin.io/'},
      { name: 'twitter:title', content: 'Tristan Timblin - Software Engineer'},
      { name: 'twitter:description', content: 'Professional profile of software engineer Tristan Timblin'},
      { name: 'twitter:image', content: '/assets/img/profile-cohere.jpg'},
      { name: 'twitter:image:alt', content: 'Profile of Tristan Timblin'},
      { name: 'mobile-web-app-capable', content: 'yes'}
    ],
    link: [
      { rel: 'author', href: 'humans.txt' },
      { rel: 'me', href: 'https://www.linkedin.com/in/tristan-timblin/', type: 'text/html' },
      { rel: 'index', href: 'https://whois.timblin.io/' }
    ]
  }
}
</script>

<style lang="scss">
.App
{
  background-color: #fff8eb;

  &-content
  {
    @include l-container;

    display: grid;

    @include query (sm)
    {
      grid-template-columns: 1fr 3fr;
      grid-gap: $spacing;
    }
  }

  &-item
  {
    min-width: 0;
  }
}
</style>
