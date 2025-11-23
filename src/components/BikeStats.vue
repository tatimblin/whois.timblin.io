<template>
  <div class="BikeStats">
    <div class="BikeStats-content">
      <div class="BikeStats-header">
        <img class="BikeStats-image" :src="getImage('baywheels-logo.svg')" alt="baywheels">
        <span
          class="BikeStats-date BikeStats-unit Text--quiet"
          :class="`BikeStats-date--${statusColor}`"
        >
          {{ relativeDate }}
        </span>
      </div>
      <div class="BikeStats-items">
        <div class="BikeStats-item">
          <span class="BikeStats-stat Heading--sub">{{ mostRecent.rides }}</span>
          <span class="BikeStats-unit Text--quiet"> rides</span>
        </div>
        <div class="BikeStats-item">
          <span class="BikeStats-stat Heading--sub">{{ roundDown(mostRecent.distance) }}</span>
          <span class="BikeStats-unit Text--quiet"> miles</span>
        </div>
        <div class="BikeStats-item">
          <span class="BikeStats-stat Heading--sub">
            {{ roundDown(mostRecent.duration / 60 / 60) }}
          </span>
          <span class="BikeStats-unit Text--quiet"> hours</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';
import bikeStatsRaw from '../bike-stats.csv';

const parsed = Papa.parse(bikeStatsRaw, { header: true, skipEmptyLines: true });

export default {
  name: 'BikeStats',
  data() {
    return {
      mostRecent: parsed.data[parsed.data.length - 1],
    };
  },
  computed: {
    diffDays() {
      if (!this.mostRecent.date) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rideDate = new Date(this.mostRecent.date);
      rideDate.setHours(0, 0, 0, 0);

      const diffTime = today - rideDate;
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },
    relativeDate() {
      if (this.diffDays === null) return '';

      if (this.diffDays === 0) return 'Today';
      if (this.diffDays === 1) return 'Yesterday';
      return `${this.diffDays} days ago`;
    },
    statusColor() {
      if (this.diffDays === null) return 'gray';
      if (this.diffDays <= 1) return 'green';
      if (this.diffDays <= 7) return 'yellow';
      return 'red';
    },
  },
  methods: {
    getImage(fileName) {
      return require(`@/assets/img/${fileName}`);
    },
    roundDown(value) {
      return Math.floor(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.BikeStats {
  @include border-container;

  &-content {
    padding: unit(50);
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: unit(50);
  }

  &-image {
    max-width: 90px;
  }

  &-date {
    display: inline-flex;
    align-items: center;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 4px;
    }

    &--green::before {
      background-color: #22c55e;
    }

    &--yellow::before {
      background-color: #eab308;
    }

    &--red::before {
      background-color: #ef4444;
    }

    &--gray::before {
      background-color: #9ca3af;
    }
  }

  &-items {
    display: flex;
    justify-content: space-around;
  }

  &-unit {
    color: $gray50;
  }
}
</style>
