<script setup lang="ts">
import {computed} from 'vue';
import Card from '@/components/Card.vue';
import type {ICard, TCardFacing, TDeck} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
  // N.B.: a watch on cards will stop if/when the array is replaced with a new array (e.g., during reshuffle)
  cards: TDeck,
  facing?: TCardFacing,
}>(), {
  facing: 'down',
})

const topCard = computed((): ICard | false => {
  if (props.cards?.length > 0) {
    if (props.facing === 'up') {
      return props.cards[props.cards.length - 1];
    }
    return props.cards[0];
  }

  return false;
});

const emit = defineEmits<{
  (e: 'click', event: Event, card: ICard): void
}>()

const emitCardClick = (event: Event) => {
  if (props.cards.length > 0) {
    emit('click', event, <ICard>props.cards.shift());
  } else {
    console.debug('deck is empty');
  }
}
</script>

<template>
  <div class="deck" @click.stop="emitCardClick">
    <Card v-if="topCard" :card="topCard"></Card>
  </div>
</template>
