<script setup lang="ts">
import {onBeforeMount, ref} from 'vue';
import Card from '@/components/Card.vue';
import CardHolder from '@/components/CardHolder.vue';
import Deck from '@/components/Deck.vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import {Session} from '@/utilities/Session';
import type {ICard, TDeck} from '@/utilities/PlayingCards';
import type {Ref} from 'vue';
import type {SessionStore, TCardHolderMap} from '@/utilities/Session';

export interface Player {
  name: string;
  uuid: string;
}

// values loaded from Session store, if available
let drawDeck: TDeck;
const players: Ref<Player[]> = ref([]);
let nextPlayerNumber = 1;

type TCardHolderMapRef = Record<string, Ref<TDeck>>;
const availableCardHolders: TCardHolderMapRef = {'house': ref([])} as TCardHolderMapRef;
const activeCardHolder: Ref<keyof TCardHolderMap> = ref('house');


onBeforeMount(() => {
  // load from saved state
  const state: SessionStore = Session.loadGameSession();

  drawDeck = state?.drawDeck ?? PlayingCards.shuffleDeck(PlayingCards.generateDeck());
  // availableCardHolders = state?.cardHolders ?? {'house': ref([])};

  if (Array.isArray(state?.players)) {
    // N.B.: Because forEach iterates over the original array, add+save doesn't get stuck in a loop here.
    state.players.forEach(player => { addPlayer(player, true); });
  } else {
    // No stored players. Create one.
    addPlayer();
  }
});

const addPlayer = (player?: Player, skipSave = false) => {
  let uuid = player?.uuid;
  if (typeof uuid === 'undefined') {
    uuid = crypto.randomUUID();
  }

  const playerNumber = nextPlayerNumber++;
  const cardHolderID = `player-${uuid}`;
  availableCardHolders[cardHolderID] = ref([]);

  players.value.push({
    name: player?.name ?? `Player ${playerNumber}`,
    uuid,
  });

  if (!skipSave) {
    Session.saveGameSession({
      // 'cardHolders': availableCardHolders,
      'players': players.value,
    });
  }
};

const removePlayer = (player: Player) => {
  const cardHolderID = `player-${player.uuid}`;
  const playerIndex = players.value.findIndex(p => p.uuid === player.uuid);

  players.value.splice(playerIndex, 1);
  delete availableCardHolders[cardHolderID];

  Session.saveGameSession({
    // 'cardHolders': availableCardHolders,
    'players': players.value,
  });
};

const setPlayerName = (player: Player) => {
  const playerIndex = players.value.findIndex(p => p.uuid === player.uuid);
  // TODO: add dialog

  players.value[playerIndex].name = `New name ${nextPlayerNumber++}`;
  Session.saveGameSession({'players': players.value});
};

const moveCard = (event: Event, card: ICard) => {
  card.facing = 'up';
  const activeCH = activeCardHolder?.value;

  if (typeof activeCH === 'string') {
    if (Array.isArray(availableCardHolders[activeCH]?.value)) {
      availableCardHolders[activeCH].value.push(card);
    } else {
      console.error('No active card holder defined for', activeCH);
    }

    Session.saveGameSession({'drawDeck': drawDeck});
  }
}
</script>

<template>
  <div class="table">
    <section class="decks">
      <CardHolder label="Draw" class="draw-deck" single-column>
        <Deck :cards="drawDeck" @click.stop="moveCard"></Deck>
      </CardHolder>
      <button @click.stop="() => addPlayer()">Add Player</button>
      <CardHolder label="Discard" class="discard-pile" single-column></CardHolder>
    </section>

    <CardHolder
        label="House"
        :is-active="activeCardHolder === 'house'"
        @click.stop="activeCardHolder = 'house'"
        class="house-dealt"
        :total="PlayingCards.totalHand(availableCardHolders['house'].value)"
    >
      <Card
          v-for="card in availableCardHolders['house'].value"
          :key="PlayingCards.getCardID(card)"
          :card="card"
      ></Card>
    </CardHolder>

<!-- TODO: allow d&d sorting -->
<!-- TODO: allow pinning -->
<!-- TODO: allow swap in/out groups of players -->
    <section class="players">
      <CardHolder
          v-for="player in players"
          :key="player.uuid"
          :is-active="activeCardHolder === `player-${player.uuid}`"
          @click.stop="activeCardHolder = `player-${player.uuid}`"
          class="player-dealt"
          :total="PlayingCards.totalHand(availableCardHolders[`player-${player.uuid}`].value)"
      >
        <template v-slot:label>
          {{ player.name }}
          <button @click.stop="setPlayerName(player)">Rename</button>
          <button @click.stop="removePlayer(player)">Remove</button>
        </template>
        <Card
            v-for="card in availableCardHolders[`player-${player.uuid}`].value"
            :key="PlayingCards.getCardID(card)"
            :card="card"
        ></Card>
      </CardHolder>
    </section>

<!-- TODO:
    <CardHolder
        label="Split"
        v-if="splitDeck.length > 0"
        :is-active="activeDeckName === 'split'"
        @click.stop="activeDeckName = 'split'"
        class="split-dealt"
    >
      <Deck :cards="splitDeck"></Deck>
    </CardHolder>
   -->

  </div>
</template>

<style scoped>
.decks {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
