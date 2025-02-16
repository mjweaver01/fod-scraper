<template>
  <div class="common-config">
    <h2>
      Ad Set Configuration for <i>{{ record.store }}</i>
    </h2>
    <div class="form-group">
      <div>
        <label>
          Optimization Goal:
          <input
            type="text"
            :value="modelValue.optimization_goal"
            @input="onChange('optimization_goal', $event.target.value)"
            :disabled="disabled"
          />
        </label>
      </div>
      <div>
        <label>
          Billing Event:
          <input
            type="text"
            :value="modelValue.billing_event"
            @input="onChange('billing_event', $event.target.value)"
            :disabled="disabled"
          />
        </label>
      </div>
      <div>
        <label>
          Bid Amount:
          <input
            type="number"
            :value="modelValue.bid_amount"
            @input="onChange('bid_amount', Number($event.target.value))"
            :disabled="disabled"
          />
        </label>
      </div>
      <div>
        <label>
          Daily Budget:
          <input
            type="number"
            :value="modelValue.daily_budget"
            @input="onChange('daily_budget', Number($event.target.value))"
            :disabled="disabled"
          />
        </label>
      </div>
      <div>
        <label>
          Campaign ID:
          <input
            type="text"
            :value="modelValue.campaign_id"
            @input="onChange('campaign_id', $event.target.value)"
            :disabled="disabled"
          />
        </label>
      </div>
      <div>
        <label>
          Promoted Page ID:
          <input
            type="text"
            :value="modelValue.promoted_object.page_id"
            @input="onPromotedObjectChange($event.target.value)"
            :disabled="disabled"
          />
        </label>
      </div>
      <div>
        <label>
          Status:
          <select
            :value="modelValue.status"
            @change="onChange('status', $event.target.value)"
            :disabled="disabled"
          >
            <option value="INACTIVE">Inactive</option>
            <option value="ACTIVE">Active</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Radius:
          <input
            type="number"
            :value="modelValue.radius"
            @input="onChange('radius', Number($event.target.value))"
            :disabled="disabled"
          />
        </label>
      </div>
      <div>
        <label>
          Distance Unit:
          <select
            :value="modelValue.distance_unit"
            @change="onChange('distance_unit', $event.target.value)"
            :disabled="disabled"
          >
            <option value="mile">Mile</option>
            <option value="kilometer">Kilometer</option>
          </select>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommonConfig',
  props: {
    record: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onChange(field, value) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [field]: value,
      })
    },
    onPromotedObjectChange(value) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        promoted_object: {
          ...this.modelValue.promoted_object,
          page_id: value,
        },
      })
    },
  },
}
</script>

<style scoped>
.common-config {
}
.common-config label {
  display: block;
  margin-bottom: 0.5rem;
}
.common-config input,
.common-config select {
}
</style>
