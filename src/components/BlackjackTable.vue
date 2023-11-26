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
import type {SessionStore} from '@/utilities/Session';

export interface Player {
  name: string;
  uuid: string;
}

const drawDeck = ref<TDeck>([]);
const discardDeck = ref<TDeck>([]);
const players = ref<Player[]>([]);
let nextPlayerNumber = 1;

type TCardHolderMapRef = Record<string, TDeck>;
/**
 * a reactive map of player names (including "House") to TDecks
 */
const availableHands: Ref<TCardHolderMapRef> = ref({ 'house': [] } as TCardHolderMapRef);
const activeCardHolder: Ref<string> = ref('house');


onBeforeMount(() => {
  // load from saved state
  const state: SessionStore = Session.loadGameSession();

  drawDeck.value = state?.drawDeck ?? PlayingCards.shuffleDeck(PlayingCards.generateDeck());
  // availableHands.value = state?.cardHolders ?? {'house': ref([])};

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
  availableHands.value[cardHolderID] = [] as TDeck;

  players.value.push({
    name: player?.name ?? `Player ${playerNumber}`,
    uuid,
  });

  if (!skipSave) {
    Session.saveGameSession({
      // 'cardHolders': availableHands.value,
      'players': players.value,
    });
  }
};

const discardAll = () => {
  Object.keys(availableHands.value).forEach(cardHolderID => discardHand(cardHolderID));
};

const discardHand = (cardHolderID: string) => {
  discardDeck.value = discardDeck.value.concat(availableHands.value[cardHolderID]);
  availableHands.value[cardHolderID].length = 0;
}

const hasDealtCards = computed((): boolean => {
  return Object.keys(availableHands.value).some(cardHolderID => {
    return availableHands.value[cardHolderID].length > 0
  });
});

const isEligibleForSplit = (cardHolderID: string) => {
  return (
      availableHands.value[cardHolderID].length === 2 &&
      availableHands.value[cardHolderID][0] === availableHands.value[cardHolderID][1]
  );
};

const moveCard = (event: Event, card: ICard) => {
  // TODO: add turn over animation
  // TODO: add movement to card holder (hand)
  card.facing = 'up';
  const activeCH = activeCardHolder?.value;

  if (typeof activeCH === 'string') {
    if (Array.isArray(availableHands.value[activeCH])) {
      availableHands.value[activeCH].push(card);
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
  delete availableHands.value[cardHolderID];

  Session.saveGameSession({
    // 'cardHolders': availableHands.value,
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
        <v-btn text="Discard All" @click.stop="discardAll" :disabled="!hasDealtCards"></v-btn>
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
        :total="PlayingCards.totalHand(availableHands['house'])"
    >
      <Card
          v-for="card in availableHands['house']"
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
          :total="PlayingCards.totalHand(availableHands[`player-${player.uuid}`])"
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
              :disabled="availableHands[`player-${player.uuid}`].length === 0"
          ></v-btn>
        </template>
        <Card
            v-for="card in availableHands[`player-${player.uuid}`]"
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
