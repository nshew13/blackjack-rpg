<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean,
  label?: string,
}>();

const hasLabel = typeof props?.label !== 'undefined';
</script>

<template>
  <div class="card-holder" :class="{'active': props.isActive}">
    <div v-if="hasLabel" class="deck-label">{{ props.label }}</div>
    <div :class="{ 'deck-area': hasLabel }">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.card-holder {
  --color-deck-label: goldenrod;

  position: relative;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;

  &.active {
    .deck-area {
      border-color: white;
    }
    .deck-label {
      color: white;
    }

  }
}
.deck-area {
  position: relative;

  aspect-ratio: 25 / 35;
  height: var(--card-area-height);
  width: auto;
  margin: var(--card-padding);
  border-radius: var(--card-corner-radius);

  border: 3px double var(--color-deck-label);

  & :deep(.card) {
    position: absolute;
    top: var(--card-padding);
    left: var(--card-padding);
  }
}
.deck-label {
  color: var(--color-deck-label);
}
</style>
