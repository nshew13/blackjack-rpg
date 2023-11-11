<script setup lang="ts">
import Card from '@/components/Card.vue';
import {PlayingCards} from '@/utilities/PlayingCards';

const deck = PlayingCards.shuffleDeck(PlayingCards.generateDeck());
</script>

<template>
  <Card
      v-for="card in deck"
      :key="`${card.suit}-${card.value}`"
      :value="card.value"
      :suit="card.suit"
  ></Card>
</template>

<style scoped>

</style>
