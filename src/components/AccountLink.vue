<template>
  <ul class="AccountLink">
    <li class="AccountLink-item" v-for="account in accounts" :key="account.url">
      <a :href="account.url" class="AccountLink-link Link">
        {{ account.name }}
      </a>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      accounts: [
        {
          name: 'Codepen',
          url: 'https://codepen.io/tatimblin',
          src: 'imageGoesHere',
        },
        {
          name: 'Github',
          url: 'https://github.com/tatimblin/',
          src: 'imageGoesHere',
        },
        {
          name: 'Dev.to',
          url: 'https://dev.to/tristimb',
          src: 'imageGoesHere',
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.AccountLink
{
  display: flex;
  flex-wrap: wrap;

  &-item
  {
    &:not(:last-child)
    {
      margin-right: calc(#{$spacing} / 2);
    }
  }
}
</style>
