<script setup lang="ts">
import {computed, onBeforeMount, ref} from 'vue';
import Card from '@/components/Card.vue';
import CardHolder from '@/components/CardHolder.vue';
import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
import Deck from '@/components/Deck.vue';
import RenameDialog from '@/components/RenameDialog.vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import {Session} from '@/utilities/Session';
import type {TCardFacing, TDeck} from '@/utilities/PlayingCards';
import type {Ref} from 'vue';
import type {SessionStore} from '@/utilities/Session';

export interface Player {
  name: string;
  uuid: string;
}

const HAND_ID_HOUSE = 'house';
const HAND_ID_PLAYER_PREFIX = 'player-';
const HOUSE_STAYS = 17;

const drawDeck = ref<TDeck>([]);
const discardDeck = ref<TDeck>([]);
const players = ref<Player[]>([]);
let nextPlayerNumber = 1;

const hasHouseRevealed = ref<boolean>(false);
const showConfirmHouse = ref<boolean>(false);

type TCardHolderMapRef = Record<string, TDeck>;
/**
 * a reactive map of player names (including "House") to TDecks
 */
// TODO: split out House
const availableHands: Ref<TCardHolderMapRef> = ref({ [HAND_ID_HOUSE]: [] } as TCardHolderMapRef);


onBeforeMount(() => {
  // load from saved state
  const state: SessionStore = Session.loadGameSession();

  drawDeck.value = state?.drawDeck ?? PlayingCards.shuffleDeck(PlayingCards.generateDeck());
  // availableHands.value = state?.cardHolders ?? {[HAND_ID_HOUSE]: ref([])};

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
  const handID = `${HAND_ID_PLAYER_PREFIX}${uuid}`;
  availableHands.value[handID] = [] as TDeck;

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

const dealInitialHands = () => {
  const playerHands = Object.keys(availableHands.value).filter(handID => handID.startsWith(HAND_ID_PLAYER_PREFIX));
  hasHouseRevealed.value = false;

  // deal one to each player
  playerHands.forEach(handID => {
    dealTo(handID);
  });

  // deal House's first card face down
  dealTo(HAND_ID_HOUSE, 'down');

  // deal second card to each player
  playerHands.forEach(handID => {
    dealTo(handID);
  });

  // deal House's second card face up
  dealTo(HAND_ID_HOUSE);

  // reveal if dealer has blackjack
  if (PlayingCards.hasBlackjack(availableHands.value[HAND_ID_HOUSE])) {
    availableHands.value[HAND_ID_HOUSE][0].facing = 'up';
    hasHouseRevealed.value = true;
  }

  Session.saveGameSession({'drawDeck': drawDeck.value});
};

const dealToHouse = () => {
  if (!hasHouseRevealed.value) {
    // warn before revealing
    // TODO: make this optional/configurable
    showConfirmHouse.value = true;
  } else {
    dealTo(HAND_ID_HOUSE);
  }
}

// TODO: add turn over animation
// TODO: add movement to card holder (hand)
const dealTo = (handID: string, facing: TCardFacing = 'up') => {
  if (handIsBust(handID)) {
    console.log('Hand is bust. I cannot even deal.');
    return;
  }

  const nextCard = PlayingCards.getTopCard(drawDeck.value);

  if (nextCard) {
    availableHands.value[handID].push(nextCard);
    nextCard.facing = facing;
  } else {
    // TODO: reshuffle and continue
  }

  Session.saveGameSession({'drawDeck': drawDeck.value});
}

const discardAll = () => {
  Object.keys(availableHands.value).forEach(handID => discardHand(handID));
};

const discardHand = (handID: string) => {
  discardDeck.value = discardDeck.value.concat(availableHands.value[handID]);
  availableHands.value[handID].length = 0;
}

const completeHouseHand = () => {
  if (!hasHouseRevealed.value) {
    revealHouseHand();
    while (houseTotal.value < HOUSE_STAYS) {
      dealToHouse();
    }
  }
}

const handIsBust = (handID: string): boolean => PlayingCards.totalHand(availableHands.value[handID]) > 21;

const handWins = (handID: string): boolean => {
  const handTotal = PlayingCards.totalHand(availableHands.value[handID]);

  return PlayingCards.hasBlackjack(availableHands.value[handID]) ||
    (handTotal <= 21 && handTotal > houseTotal.value);
};

const hasDealtCards = computed((): boolean => {
  return Object.keys(availableHands.value).some(handID => {
    return availableHands.value[handID].length > 0
  });
});

const houseTotal = computed((): number => PlayingCards.totalHand(availableHands.value[HAND_ID_HOUSE]));

const isEligibleForSplit = (handID: string) => {
  return (
      availableHands.value[handID].length === 2 &&
      availableHands.value[handID][0] === availableHands.value[handID][1]
  );
};

const removePlayer = (player: Player) => {
  const handID = `${HAND_ID_PLAYER_PREFIX}${player.uuid}`;
  const playerIndex = players.value.findIndex(p => p.uuid === player.uuid);

  players.value.splice(playerIndex, 1);
  delete availableHands.value[handID];

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

const revealHouseHand = () => {
  availableHands.value[HAND_ID_HOUSE].forEach(card => { card.facing = 'up'; });
  hasHouseRevealed.value = true;
}

const setPlayerName = (player: Player, newName: string) => {
  if (newName) {
    const playerIndex = players.value.findIndex(p => p.uuid === player.uuid);
    players.value[playerIndex].name = newName;
    Session.saveGameSession({'players': players.value});
  }
};

const splitHand = (player: Player) => {
  console.log(`TODO: split hand for ${player.name}`);
};
</script>

<template>
  <div class="table">
    <ConfirmationDialog
        :show-dialog="showConfirmHouse"
        message="Do you want to reveal the House's hand?"
        @ok="revealHouseHand"
        @close="showConfirmHouse = false"
    ></ConfirmationDialog>

    <section class="decks">
      <CardHolder label="Draw" class="draw-deck" single-column>
        <Deck :cards="drawDeck" @reshuffle="reshuffleDrawDeck"></Deck>

        <template v-slot:actions v-if="drawDeck.length <= 0">
          <v-btn text="Shuffle" @click.stop="reshuffleDrawDeck"></v-btn>
        </template>
      </CardHolder>

      <div class="main-actions">
        <v-btn text="Add Player" @click.stop="addPlayer"></v-btn>
        <v-btn text="Deal" @click.stop="dealInitialHands" :disabled="hasDealtCards"></v-btn>
        <v-btn text="Discard All" @click.stop="discardAll" :disabled="!hasDealtCards"></v-btn>
      </div>

      <CardHolder label="Discard" class="discard-pile" single-column>
        <Deck :cards="discardDeck" facing="up"></Deck>
      </CardHolder>
    </section>

    <CardHolder
        @click.stop="dealToHouse"
        class="house-dealt"
        :bust="handIsBust(HAND_ID_HOUSE)"
        :total="hasHouseRevealed ? PlayingCards.totalHand(availableHands[HAND_ID_HOUSE]) : -1"
        :win="handIsBust(HAND_ID_HOUSE)"
    >
      <template v-slot:header>
        <div class="player-name">House</div>
        <v-btn
            text="Finish Hand"
            :disabled="!(hasDealtCards && !hasHouseRevealed)"
            @click.stop="completeHouseHand"
        ></v-btn>
      </template>
      <Card
          v-for="card in availableHands[HAND_ID_HOUSE]"
          :key="PlayingCards.getCardID(card)"
          :card="card"
          random-layout
          @card-reveal="hasHouseRevealed = true"
      ></Card>
    </CardHolder>

<!-- TODO: allow d&d sorting -->
<!-- TODO: allow pinning -->
<!-- TODO: allow swap in/out groups of players -->
    <section class="players">
      <CardHolder
          v-for="player in players"
          :key="player.uuid"
          @click.stop="dealTo(`${HAND_ID_PLAYER_PREFIX}${player.uuid}`)"
          class="player-dealt"
          :bust="handIsBust(`${HAND_ID_PLAYER_PREFIX}${player.uuid}`)"
          :total="PlayingCards.totalHand(availableHands[`${HAND_ID_PLAYER_PREFIX}${player.uuid}`])"
          :win="handWins(`${HAND_ID_PLAYER_PREFIX}${player.uuid}`)"
      >
        <template v-slot:header>
          <div class="player-name">{{ player.name }}</div>
          <RenameDialog @update="(evt, name) => setPlayerName(player, name)"></RenameDialog>
          <v-btn
              text="Remove"
              @click.stop="removePlayer(player)"
              :disabled="players.length <= 1"
          ></v-btn>
        </template>
        <Card
            v-for="card in availableHands[`${HAND_ID_PLAYER_PREFIX}${player.uuid}`]"
            :key="PlayingCards.getCardID(card)"
            :card="card"
            random-layout
        ></Card>
        <template v-slot:actions>
          <v-btn
              v-if="isEligibleForSplit(`${HAND_ID_PLAYER_PREFIX}${player.uuid}`)"
              text="Split"
              @click.stop="splitHand(player)"
          ></v-btn>
        </template>
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
  white-space: unset;
}
</style>
