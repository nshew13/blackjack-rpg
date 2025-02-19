<!-- component: CardStandard -->
<script setup lang="ts">
import {computed} from 'vue';
import {PlayingCardUtils} from '@/utilities/PlayingCardUtils';
import SuitSymbol from '@/components/SuitSymbol.vue';
import type {ICard, TCardSize} from '@/utilities/PlayingCards';

interface IProps {
    animate?: boolean;
    cardSize?: TCardSize;
    randomLayout?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    animate: true,
    cardSize: 'large',
    randomLayout: false,
});

const card = defineModel<ICard>({required: true});

const emit = defineEmits<{
    (e: 'card-reveal'): void
}>();

const animationClasses = computed((): string => {
    if (props.animate) {
        return 'animated slideInDown faster';
    }

    return '';
});

const isFaceUp = computed(() => card.value?.facing === 'up');

const getStyle = computed(() => {
    const styles: Record<string, string> = {
        'color': PlayingCardUtils.getColor(card.value?.suit),  // TODO: this gives away color in markup
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
    if (typeof card.value?.facing !== 'undefined') {
        if(card.value?.facing === 'down') {
            emit('card-reveal');
        }
        card.value.facing = 'up';
    }
};
</script>

<template>
  <Transition
    appear
    :enter-active-class="animationClasses"
  >
    <div
      class="card"
      :class="cardClasses"
      :style="getStyle"
      @click="flipCardUp"
    >
      <template v-if="card && isFaceUp">
        <div :class="faceClasses">
          {{ card.value }}
          <SuitSymbol :suit="card.suit" />
        </div>
        <div
          v-if="cardSize === 'large'"
          class="corner bottom-right"
        >
          {{ card.value }}
          <SuitSymbol :suit="card.suit" />
        </div>
      </template>
    </div>
  </Transition>
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
