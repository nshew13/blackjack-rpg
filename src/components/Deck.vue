<script setup lang="ts">
import Card from '@/components/Card.vue';
import type {ICard, TDeck} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
  cards: TDeck,
  facing?: 'up' | 'down',
}>(), {
  facing: 'down',
})

const emit = defineEmits<{
  (e: 'click', event: Event, card: ICard): void
}>()

const hasCard = props.cards?.length > 0;

const emitCardClick = (event: Event) => {
  if (props.cards.length > 0) {
    emit('click', event, <ICard>props.cards.shift());
  }
}
</script>

<template>
  <div class="deck" @click.stop="emitCardClick">
    <Card v-if="hasCard" :card="cards[0]"></Card>
  </div>
</template>
