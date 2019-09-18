<template>
  <article class="JobItem">
    <div class="JobItem-media">
      icon
    </div>
    <div class="JobItem-content">
      <h4 class="JobItem-title">Front End Developer</h4>
      <h3 class="JobItem-role">Yext</h3>
      <span class="JobItem-duration">
        <time class="JobItem-date">2019</time>
        <span class="JobItem-current">Current</span>
      </span>
      <p class="JobItem-desc">About the job</p>
      <a href="#" class="JobItem-referral">Want to work with me?</a>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.JobItem
{
  display: grid;
  grid-template-columns: 60px auto;
  grid-gap: $spacing / 2;
  padding: $spacing / 2;
}
</style>