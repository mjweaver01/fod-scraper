<template>
  <div class="common-config">
    <h2>
      Ad Set Configuration for <i>{{ record.store }}</i>
    </h2>
    <div class="form-group">
      <div>
        <label>
          Status
          <div class="select">
            <select
              :value="modelValue.status"
              @change="onChange('status', $event.target.value)"
              :disabled="disabled"
            >
              <option value="INACTIVE">Inactive</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
        </label>
      </div>
      <div>
        <label>
          Optimization Goal
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
          Billing Event
          <input
            type="text"
            :value="modelValue.billing_event"
            @input="onChange('billing_event', $event.target.value)"
            :disabled="disabled"
          />
        </label>
      </div>
    </div>
    <div class="form-group">
      <div>
        <label>
          Bid Amount
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
          Daily Budget
          <input
            type="number"
            :value="modelValue.daily_budget"
            @input="onChange('daily_budget', Number($event.target.value))"
            :disabled="disabled"
          />
        </label>
      </div>
    </div>
    <div class="form-group">
      <div>
        <label>
          Campaign ID
          <div class="select">
            <select
              :value="modelValue.campaign_id"
              @change="onChange('campaign_id', $event.target.value)"
              :disabled="disabled"
            >
              <option
                v-for="campaign in facebook.campaigns"
                :key="campaign.id"
                :value="campaign.id"
              >
                {{ campaign.name }}
              </option>
            </select>
          </div>
        </label>
      </div>
      <div>
        <label>
          Promoted Page ID
          <div class="select">
            <select
              :value="modelValue.promoted_object.page_id"
              @change="onPromotedObjectChange($event.target.value)"
              :disabled="disabled"
            >
              <option v-for="page in facebook.promotedPages" :key="page.id" :value="page.id">
                {{ page.name }}
              </option>
            </select>
          </div>
        </label>
      </div>
    </div>
    <div class="form-group">
      <div>
        <label>
          Radius
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
          Distance Unit
          <div class="select">
            <select
              :value="modelValue.distance_unit"
              @change="onChange('distance_unit', $event.target.value)"
              :disabled="disabled"
            >
              <option value="mile">Mile</option>
              <option value="kilometer">Kilometer</option>
            </select>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { useFacebookStore } from '@/stores/facebook'

export default {
  name: 'AdsetConfig',
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
  computed: {
    facebook() {
      return useFacebookStore()
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

<style lang="scss" scoped>
.common-config {
  padding: 0.5em;

  .form-group:last-child {
    margin-bottom: 0;
  }
}
</style>
