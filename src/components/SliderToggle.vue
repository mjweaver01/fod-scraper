<template>
  <div class="slider-toggle">
    <input
      type="checkbox"
      :id="toggleId"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <label :for="toggleId" class="slider"></label>
    <label :for="toggleId" class="slider-label" :style="{ maxWidth: labelMaxWidth }">{{
      label
    }}</label>
  </div>
</template>

<script>
export default {
  name: 'SliderToggle',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    labelMaxWidth: {
      type: String,
      default: '200px',
    },
  },
  data() {
    return {
      toggleId: `slider-toggle-${Math.random().toString(36).substr(2, 9)}`, // Unique ID for each instance
    }
  },
}
</script>

<style lang="scss" scoped>
.slider-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .slider-label {
    font-size: 0.9rem;
    color: var(--text);
  }

  input {
    display: none;
  }

  label {
    cursor: pointer;
  }

  .slider {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    cursor: pointer;
    background-color: var(--light-gray);
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: '';
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: var(--white);
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: var(--primary);
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }
}
</style>
