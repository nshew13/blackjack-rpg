<script setup lang="ts">
import Card from '@/components/Card.vue';
import {PlayingCards} from '@/utilities/PlayingCards';

const props = defineProps<{
  facing: 'up' | 'down',
}>();

const deck = PlayingCards.shuffleDeck(PlayingCards.generateDeck());
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
