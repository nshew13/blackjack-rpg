<script setup lang="ts">
import {ref} from 'vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import SuitSymbol from '@/components/SuitSymbol.vue';
import type {ICard} from '@/utilities/PlayingCards';

const props = defineProps<{
  card: ICard,
}>();

let isFaceUp = ref(props.card.facing === 'up');
const color = PlayingCards.getColor(props.card.suit);

// const flipCard = () => {
//   isFaceUp.value = !isFaceUp.value;
// }
// @click.stop="flipCard"

</script>

<template>
  <div
      class="card"
      :class="{'face-down': !isFaceUp}"
  >
    <template v-if="isFaceUp">
      <div class="corner top-left">
        {{ props.card.value }} <SuitSymbol :suit="props.card.suit"></SuitSymbol>
      </div>
      <div class="corner bottom-right">
        {{ props.card.value }} <SuitSymbol :suit="props.card.suit"></SuitSymbol>
      </div>
    </template>
  </div>
</template>

<style scoped>
.card {
  position: relative; /* for corner positioning */

  aspect-ratio: 25 / 35;
  height: var(--card-height);
  width: auto;
  margin: var(--card-margin);

  padding: var(--card-padding);
  font-size: max(16pt, calc(0.15 * var(--card-height)));
  line-height: 1;

  /* TODO: this gives away color in markup */
  color: v-bind(color);
  text-align: center;
  background-color: white;
  border-radius: var(--card-corner-radius);

  box-shadow: 0 0 5px black;

  &.face-down {
    background: rgb(2,0,36);
    background: radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 9%, rgba(0,212,255,1) 32%, rgba(9,9,121,1) 100%);
  }

  transition: transform 250ms;

  &:hover {
    z-index: 64; /* above other cards in standard deck */
    transform: rotate(-5deg) translateY(-20px);
  }
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
