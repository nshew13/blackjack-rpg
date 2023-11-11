<script setup lang="ts">
import {PlayingCards} from '@/utilities/PlayingCards';
import SuitSymbol from '@/components/SuitSymbol.vue';
import type {TCardSuit, TCardValue} from '@/utilities/PlayingCards';

const props = defineProps<{
  value: TCardValue,
  suit: TCardSuit,
}>()

const color = PlayingCards.getColor(props.suit);
</script>

<template>
  <div class="card">
    <div class="corner top-left">
      {{ props.value }} <SuitSymbol :suit="props.suit"></SuitSymbol>
    </div>
    <div class="corner bottom-right">
      {{ props.value }} <SuitSymbol :suit="props.suit"></SuitSymbol>
    </div>
  </div>
</template>

<style scoped>
.card {
  --card-padding: 20px;

  position: relative;

  aspect-ratio: 25 / 35;
  height: 350px;
  width: auto;

  padding: var(--card-padding);
  font-size: 50px;
  line-height: 1;

  color: v-bind(color);
  background-color: white;
  border-radius: 10px;
}
.corner {
  position: absolute;

  &.top-left {
    top: var(--card-padding);
    left: var(--card-padding);
  }

  &.bottom-right {
    right: var(--card-padding);
    bottom: var(--card-padding);
    transform: rotate(180deg);
  }
}
</style>
