<template>
  <ul class="AccountLink">
    <li class="AccountLink-item" v-for="account in accounts" :key="account.url">
      <a :href="account.url" class="AccountLink-link">
        {{ account.name }}
      </a>
    </li>
  </ul>
</template>

<script>
export default {
  data () {
    return {
      accounts: [
        {
          name: 'Codepen',
          url: 'codepen.com',
          src: 'imageGoesHere'
        },
        {
          name: 'Github',
          url: 'github.com',
          src: 'imageGoesHere'
        },
        {
          name: 'Dev.to',
          url: 'dev.to',
          src: 'imageGoesHere'
        }
      ]
    }
  }
}
</script>