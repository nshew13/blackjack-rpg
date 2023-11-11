<script setup lang="ts">
import Card from '@/components/Card.vue';
import {PlayingCards} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
  facing?: 'up' | 'down',
}>(), {
  facing: 'down',
})

const deck = PlayingCards.shuffleDeck(PlayingCards.generateDeck({ facing: props.facing }));
</script>

<template>
  <div class="deck">
    <Card
        v-for="card in deck"
        :key="PlayingCards.getCardID(card)"
        :card="card"
    ></Card>
  </div>
</template>

<style scoped>
.deck {
  position: relative;

  & :deep(.card) {
    top: 0;
    left: 35px;
  }
}
</style>
