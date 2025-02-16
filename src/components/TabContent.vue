<template>
  <div class="tab-container">
    <!-- Desktop view: render tabs horizontally -->
    <div class="tab-headers">
      <router-link
        v-for="tab in tabs"
        :key="tab.id"
        :to="tab.path"
        custom
        v-slot="{ isActive, navigate }"
      >
        <div class="tab-header" :class="{ active: isActive }" @click="navigate">
          {{ tab.title }}
        </div>
      </router-link>
    </div>
    <!-- Mobile view: render a dropdown -->
    <div class="tab-dropdown">
      <div v-if="label" class="label">{{ label }}</div>
      <div class="select model-select">
        <select v-model="currentTab" @change="onTabChange">
          <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
            {{ tab.title }}
          </option>
        </select>
      </div>
    </div>
    <div class="tab-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      required: true,
      validator: (tabs) => tabs.every((tab) => tab.title && tab.path),
    },
    label: {
      type: String,
    },
  },
  data() {
    return {
      currentTab: this.$route.params.index,
    }
  },
  methods: {
    onTabChange() {
      this.$router.push(`/scrape/${this.currentTab}`)
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    '$route.path'(newPath) {
      if (this.$route.path !== newPath) {
        this.currentTab = this.$route.params.index
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tab-container {
  width: 100%;
  overflow: hidden;
}

.tab-headers {
  overflow: auto;
  border: 1px solid var(--primary);
  display: none;

  @media (min-width: $tablet) {
    display: flex;
  }
}

.tab-header {
  padding: 1rem;
  cursor: pointer;
  border-right: 1px solid var(--primary);
  background: var(--white);
  text-transform: uppercase;
  font-weight: bold;
  white-space: nowrap;
  flex-grow: 1;
  text-align: center;

  @media (min-width: $tablet) {
    padding: 17.75px;
    height: 53px; //SET SAME HEIGHT AS SEARCH
  }

  &:last-child {
    border-right: none;
  }

  @media (min-width: $mobile) {
    &:hover {
      background: var(--light-primary);
    }
  }

  &:active,
  &.active {
    background: var(--primary);
    color: var(--white);
  }
}

.tab-dropdown {
  @media (min-width: $tablet) {
    display: none;
  }
}

.tab-content {
  padding: 1rem 0;
}
</style>
