<script setup lang="ts">
import {computed, ref} from 'vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import SuitSymbol from '@/components/SuitSymbol.vue';
import type {ICard} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
  card: ICard,
  randomLayout?: boolean
}>(), {
  randomLayout: false,
});

let isFaceUp = ref(props.card.facing === 'up');

const randomAngle = Math.floor((Math.random() - 0.5) * 10);
const randomOffset = Math.floor((Math.random() - 0.5) * 10);

const getStyle = computed(() => {
  const styles: Record<string, string> = {
    'color': PlayingCards.getColor(props.card.suit),  // TODO: this gives away color in markup
  };
  if (props.randomLayout) {
    styles.transform = `translateY(${randomOffset}px) rotate(${randomAngle}deg)`;
  }

  return styles;
});


// const flipCard = () => {
//   isFaceUp.value = !isFaceUp.value;
// }
// @click.stop="flipCard"
</script>

<template>
  <div
      class="card"
      :class="{'face-down': !isFaceUp}"
      :style="getStyle"
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
  --card-padding: 10px;

  position: relative; /* for corner positioning */

  box-sizing: border-box;
  height: var(--card-height);
  width: var(--card-width);
  padding: var(--card-padding);

  font-family: "BioRhyme", "Droid Serif", serif;
  font-size: 2rem;
  line-height: 1;

  text-align: center;
  background-color: white;
  border-radius: var(--card-corner-radius);

  box-shadow: 0 0 5px black;

  &.face-down {
    background: rgb(2,0,36);
    background: radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 9%, rgba(0,212,255,1) 32%, rgba(9,9,121,1) 100%);
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
