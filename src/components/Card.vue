<script setup lang="ts">
import {computed} from 'vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import SuitSymbol from '@/components/SuitSymbol.vue';
import type {ICard, TCardSize} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
    card: ICard,
    cardSize?: TCardSize,
    randomLayout?: boolean
}>(), {
    cardSize: 'large',
    randomLayout: false,
});

const emit = defineEmits<{
    (e: 'card-reveal'): void
}>();


const isFaceUp = computed(() => props.card.facing === 'up');

const getStyle = computed(() => {
    const styles: Record<string, string> = {
        'color': PlayingCards.getColor(props.card.suit),  // TODO: this gives away color in markup
    };
    if (props.randomLayout) {
        styles.transform = `translateY(${randomOffset}px) rotate(${randomAngle}deg)`;
    }

    return styles;
});

const cardClasses = computed(() => {
    return [
        { 'face-down': !isFaceUp.value },
        props.cardSize,
    ];
});

const faceClasses = computed(() => {
    if (props.cardSize === 'large') {
        return 'corner top-left';
    }

    return 'marker';
});

const randomAngle = Math.floor((Math.random() - 0.5) * 10);
const randomOffset = Math.floor((Math.random() - 0.5) * 10);

const flipCardUp = () => {
    if (props.card.facing === 'down') {
        emit('card-reveal');
    }
    props.card.facing = 'up';
};
</script>

<template>
  <div
      class="card"
      :class="cardClasses"
      :style="getStyle"
      @click="flipCardUp"
  >
    <template v-if="isFaceUp">
      <div :class="faceClasses">
        {{ props.card.value }}
        <SuitSymbol :suit="props.card.suit"></SuitSymbol>
      </div>
      <div v-if="cardSize === 'large'" class="corner bottom-right">
        {{ props.card.value }}
        <SuitSymbol :suit="props.card.suit"></SuitSymbol>
      </div>
    </template>
  </div>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
.card {
  &.small {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
  }

  position: relative; /* for corner positioning */

  box-sizing: border-box;
  aspect-ratio: var(--card-aspect-ratio);
  height: var(--card-height);
  width: auto;
  padding: var(--card-padding);

  font-family: "BioRhyme", "Droid Serif", serif;
  font-size: 2rem;
  line-height: 1;

  text-align: center;
  background-color: white;
  border-radius: var(--card-corner-radius);

  box-shadow: 0 0 5px black;

  &.face-down {
    background: rgb(2, 0, 36);
    background: radial-gradient(circle, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 9%, rgba(0, 212, 255, 1) 32%, rgba(9, 9, 121, 1) 100%);
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
