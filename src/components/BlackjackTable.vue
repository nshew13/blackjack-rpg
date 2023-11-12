<script setup lang="ts">
import {Ref, ref} from 'vue';
import Deck from '@/components/Deck.vue';
import CardHolder from '@/components/CardHolder.vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import type {ICard, TDeck} from '@/utilities/PlayingCards';

const playerDeck: TDeck = ref([]);
const houseDeck: TDeck = ref([]);

const activeDeckName: Ref<'house' | 'player' | 'split'> = ref('player');

/**
 * The last card in the deck array will be the top card. It's just easier
 * to let the DOM elements stack as they will. It's also easier to pop
 * cards off the end.
 */
const deck = PlayingCards.shuffleDeck(PlayingCards.generateDeck());

const moveCard = (event: Event, card: ICard) => {
  card.facing = 'up';
  switch (activeDeckName.value) {
    case 'house':
      houseDeck.value.push(card);
      break;
    case 'player':
      playerDeck.value.push(card);
      break;
  }
}
</script>

<template>
  <div class="table">
    <CardHolder label="Draw">
      <Deck :cards="deck" @click.stop="moveCard"></Deck>
    </CardHolder>
    <CardHolder label="Discard"></CardHolder>
    <CardHolder label="Player" :is-active="activeDeckName === 'player'" @click.stop="activeDeckName = 'player'">
      <Deck :cards="playerDeck"></Deck>
    </CardHolder>
    <CardHolder label="House" :is-active="activeDeckName === 'house'" @click.stop="activeDeckName = 'house'">
      <Deck :cards="houseDeck"></Deck>
    </CardHolder>
  </div>
</template>

<style scoped>
</style>
