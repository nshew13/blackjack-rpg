<script setup lang="ts">
const props = withDefaults(defineProps<{
  columns?: number,
  isActive?: boolean,
  label?: string,
}>(), {
  columns: 1,
  label: '',
});
</script>

<template>
  <div class="card-holder" :class="{'active': props.isActive}">
    <div class="label">{{ props.label }}</div>
    <div class="card-area">
      <slot>
        <!-- expected <Card>(s) or <Deck> -->
      </slot>
    </div>
  </div>
</template>

<style scoped>
.card-holder {
  --color-label: goldenrod;

  /* center label and area along vertical axis */
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;

  &.active {
    .card-area {
      border-color: white;
    }
    .label {
      color: white;
    }

  }
}
.card-area {
  --area-border-width: 3px;

  display: flex;
  justify-content: space-around;

  min-height: calc(var(--card-box-height) + var(--area-border-width) * 2);
  min-width: calc(var(--card-box-width) * v-bind(columns) + var(--area-border-width) * 2);
  margin: var(--card-padding);
  border-radius: var(--card-corner-radius);

  border: var(--area-border-width) double var(--color-label);
}
.label {
  color: var(--color-label);
}
</style>
