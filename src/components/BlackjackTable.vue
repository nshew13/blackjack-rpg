<script setup lang="ts">
import {computed, onBeforeMount, ref} from 'vue';
import Card from '@/components/Card.vue';
import CardHolder from '@/components/CardHolder.vue';
import Deck from '@/components/Deck.vue';
import RenameDialog from '@/components/RenameDialog.vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import {Session} from '@/utilities/Session';
import type {ICard, TDeck} from '@/utilities/PlayingCards';
import type {Ref} from 'vue';
import type {SessionStore, TCardHolderMap} from '@/utilities/Session';

export interface Player {
  name: string;
  uuid: string;
}

const drawDeck = ref<TDeck>([]);
const discardDeck = ref<TDeck>([]);
const players = ref<Player[]>([]);
let nextPlayerNumber = 1;

type TCardHolderMapRef = Record<string, Ref<TDeck>>;
const availableCardHolders: TCardHolderMapRef = {'house': ref([])} as TCardHolderMapRef;
const activeCardHolder: Ref<keyof TCardHolderMap> = ref('house');


onBeforeMount(() => {
  // load from saved state
  const state: SessionStore = Session.loadGameSession();

  drawDeck.value = state?.drawDeck ?? PlayingCards.shuffleDeck(PlayingCards.generateDeck());
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

const cardsDealt = computed((): boolean => {
  // TODO: this doesn't work because availableCardHolders isn't reactive
  // Object.keys(availableCardHolders).forEach(cardHolderID => {
  //   if (availableCardHolders[cardHolderID].value.length > 0) {
  //     return true;
  //   }
  // });

  if (availableCardHolders.house.value.length > 0) {
    return true;
  }

  players.value.forEach(player => {
    if (availableCardHolders[`player-${player.uuid}`].value.length > 0) {
      return true;
    }
  });

  return false;
});

const discardAll = () => {
  Object.keys(availableCardHolders).forEach(cardHolderID => discardHand(cardHolderID));
};

const discardHand = (cardHolderID: string) => {
  discardDeck.value = discardDeck.value.concat(availableCardHolders[cardHolderID].value);
  availableCardHolders[cardHolderID].value.length = 0;
}

const moveCard = (event: Event, card: ICard) => {
  // TODO: add turn over animation
  // TODO: add movement to card holder (hand)
  card.facing = 'up';
  const activeCH = activeCardHolder?.value;

  if (typeof activeCH === 'string') {
    if (Array.isArray(availableCardHolders[activeCH]?.value)) {
      availableCardHolders[activeCH].value.push(card);
    } else {
      console.error('No active card holder defined for', activeCH);
    }

    Session.saveGameSession({'drawDeck': drawDeck.value});
  }
}

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

const reshuffleDrawDeck = () => {
  drawDeck.value = PlayingCards.shuffleDeck(PlayingCards.generateDeck());
  Session.saveGameSession({'drawDeck': drawDeck.value});
  // TODO: empty discard
  // TODO: leave cards on table
  // TODO: reshuffle the same deck (number of cards, etc.)
}

const setPlayerName = (player: Player, newName: string) => {
  if (newName) {
    const playerIndex = players.value.findIndex(p => p.uuid === player.uuid);
    players.value[playerIndex].name = newName;
    Session.saveGameSession({'players': players.value});
  }
};
</script>

<template>
  <div class="table">
    <section class="decks">
      <CardHolder label="Draw" class="draw-deck" single-column>
        <Deck :cards="drawDeck" @click.stop="moveCard" @reshuffle="reshuffleDrawDeck"></Deck>

        <template v-slot:actions v-if="drawDeck.length <= 0">
          <v-btn text="Shuffle" @click.stop="reshuffleDrawDeck"></v-btn>
        </template>
      </CardHolder>

      <div class="main-actions">
        <v-btn text="Add Player" @click.stop="addPlayer"></v-btn>
        <v-btn text="Discard All" @click.stop="discardAll" :disabled="!cardsDealt"></v-btn>
      </div>

      <CardHolder label="Discard" class="discard-pile" single-column>
        <Deck :cards="discardDeck" facing="up"></Deck>
      </CardHolder>
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
          random-layout
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
        <template v-slot:header>
          <div class="player-name">{{ player.name }}</div>
          <RenameDialog @update="(evt, name) => setPlayerName(player, name)"></RenameDialog>
          <v-btn
              text="Remove"
              @click.stop="removePlayer(player)"
              :disabled="players.length <= 1"
          ></v-btn>
          <v-btn
              text="Discard"
              @click.stop="discardHand(`player-${player.uuid}`)"
              :disabled="availableCardHolders[`player-${player.uuid}`].value.length === 0"
          ></v-btn>
        </template>
        <Card
            v-for="card in availableCardHolders[`player-${player.uuid}`].value"
            :key="PlayingCards.getCardID(card)"
            :card="card"
            random-layout
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
.main-actions {
  align-self: stretch;

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.player-name {
  width: 200px;
  margin-right: 2em;
  overflow-x: clip;
  text-overflow: ellipsis;
}
:deep(.v-btn) {
  margin: 0.5em;
}
</style>
