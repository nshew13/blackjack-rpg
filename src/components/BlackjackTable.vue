<script setup lang="ts">
import {ref} from 'vue';
import Deck from '@/components/Deck.vue';
import CardHolder from '@/components/CardHolder.vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import type {Ref} from 'vue';
import type {ICard, TDeck} from '@/utilities/PlayingCards';
import Card from '@/components/Card.vue';

const houseDeck: Ref<TDeck> = ref([]);
const playerDeck: Ref<TDeck> = ref([]);
const splitDeck: Ref<TDeck> = ref([]);
const numPlayers: Ref<number> = ref(1);

const playerDecks: Ref<TDeck> = ref([]);


const activeDeckName: Ref<'house' | 'player' | 'split'> = ref('player');
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
    <section class="decks">
      <CardHolder label="Draw" class="draw-deck" single-column>
        <Deck :cards="deck" @click.stop="moveCard"></Deck>
      </CardHolder>
      <CardHolder label="Discard" class="discard-pile" single-column></CardHolder>
    </section>

    <section class="players">
      <CardHolder
          v-for="n in numPlayers"
          :key="n"
          :label="`Player ${n}`"
          :is-active="activeDeckName === 'player'"
          @click.stop="activeDeckName = 'player'"
          class="player-dealt"
          :total="PlayingCards.totalHand(playerDeck)"
      >
        <Card
            v-for="card in playerDeck"
            :key="PlayingCards.getCardID(card)"
            :card="card"
        ></Card>
      </CardHolder>
    </section>

    <CardHolder
        label="Split"
        v-if="splitDeck.length > 0"
        :is-active="activeDeckName === 'split'"
        @click.stop="activeDeckName = 'split'"
        class="split-dealt"
    >
      <Deck :cards="splitDeck"></Deck>
    </CardHolder>

    <CardHolder
        label="House"
        :is-active="activeDeckName === 'house'"
        @click.stop="activeDeckName = 'house'"
        class="house-dealt"
    >
      <Deck :cards="houseDeck"></Deck>
    </CardHolder>
  </div>
</template>

<style scoped>
.decks {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
