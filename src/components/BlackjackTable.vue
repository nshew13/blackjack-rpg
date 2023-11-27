<script setup lang="ts">
import {computed, onBeforeMount, ref, watch} from 'vue';
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

export interface IPlayer {
  name: string;
  uuid: string;
}

type TCardHolderMapRef = Record<string /* IPlayer.uuid */, TDeck>;


const HOUSE_STAYS = 17;
let nextPlayerNumber = 1;

//
//
// REF and COMPUTED
//

const drawDeck = ref<TDeck>([]);
const discardDeck = ref<TDeck>([]);
const players = ref<IPlayer[]>([]);

const hasHouseRevealed = ref<boolean>(false);
const houseWins = ref<boolean>(false);
const showConfirmHouse = ref<boolean>(false);
const stayedPlayerIDs = ref<string[]>([]);

/**
 * a reactive map of player UUIDs to TDecks
 */
const playerHandsMap: Ref<TCardHolderMapRef> = ref({});
const houseHand: Ref<TDeck> = ref([]);

const allPlayersAreBust = computed((): boolean => {
  return playerHands.value.every(hand => handIsBust(hand));
});

const hasDealtCards = computed((): boolean => {
  if (houseHand.value.length > 0) {
    return true;
  }

  return playerHands.value.some(hand => hand.length > 0);
});

const houseTotal = computed((): number => PlayingCards.totalHand(houseHand.value));

const playerHands = computed((): Array<TDeck> => {
  if (typeof playerHandsMap.value === 'undefined') {
    return [];
  }

  return Object.values(playerHandsMap.value);
});

//
//
// WATCHES and LIFECYCLE HOOKS
//

// TODO: combine into watchEffect?
watch(allPlayersAreBust, () => {
  if (allPlayersAreBust.value) {
    houseWins.value = true;
    revealHouseHand();
  }
});

onBeforeMount(() => {
  // load from saved state
  const state: SessionStore = Session.loadGameSession();

  drawDeck.value = state?.drawDeck ?? PlayingCards.shuffleDeck(PlayingCards.generateDeck());

  if (Array.isArray(state?.players)) {
    // N.B.: Because forEach iterates over the original array, add+save doesn't get stuck in a loop here.
    state.players.forEach(player => { addPlayer(player, true); });
  } else {
    // No stored players. Create one.
    addPlayer();
  }
});

//
//
// OTHER METHODS
//

const addPlayer = (player?: IPlayer, skipSave = false) => {
  let uuid = player?.uuid;
  if (typeof uuid === 'undefined') {
    uuid = crypto.randomUUID();
  }

  const playerNumber = nextPlayerNumber++;
  playerHandsMap.value[uuid] = [] as TDeck;

  players.value.push({
    name: player?.name ?? `Player ${playerNumber}`,
    uuid,
  });

  if (!skipSave) {
    Session.saveGameSession({
      'players': players.value,
    });
  }
};

const dealInitialHands = () => {
  hasHouseRevealed.value = false;

  // deal one to each player
  players.value.forEach(player => { dealToPlayer(player); });

  // deal House's first card face down
  dealToHouse(true, 'down');

  // deal second card to each player
  players.value.forEach(player => { dealToPlayer(player); });

  // deal House's second card face up
  dealToHouse(true);

  // reveal if dealer has blackjack
  if (PlayingCards.hasBlackjack(houseHand.value)) {
    revealHouseHand();
  }

  // TODO: move save session calls into watch(es)
  Session.saveGameSession({'drawDeck': drawDeck.value});
};

const dealTo = (hand: TDeck, facing: TCardFacing = 'up') => {
  if (handIsBust(hand)) {
    console.log('Hand is bust. I cannot even deal.');
    return;
  }

  const nextCard = PlayingCards.getTopCard(drawDeck.value);

  if (nextCard) {
    hand.push(nextCard);
    nextCard.facing = facing;
  } else {
    // TODO: reshuffle and continue
  }

  Session.saveGameSession({'drawDeck': drawDeck.value});
}

const dealToHouse = (skipWarning = false, facing: TCardFacing = 'up') => {
  if (!skipWarning && !hasHouseRevealed.value) {
    // warn before revealing
    // TODO: make this optional/configurable
    showConfirmHouse.value = true;
  } else {
    dealTo(houseHand.value, facing)
  }
}

// TODO: add turn over animation
// TODO: add movement to card holder (hand)
const dealToPlayer = (player: IPlayer) => {
  if (stayedPlayerIDs.value.includes(player.uuid)) {
    return;
  }

  const hand = playerHandsMap.value[player.uuid];
  dealTo(hand);
}

const discardAll = () => {
  discardHand(houseHand.value);
  playerHands.value.forEach(hand => discardHand(hand));
  stayedPlayerIDs.value.length = 0;
};

const discardHand = (hand: TDeck) => {
  discardDeck.value = discardDeck.value.concat(hand);
  hand.length = 0;
}

const completeHouseHand = () => {
  if (!hasHouseRevealed.value) {
    revealHouseHand();
    while (houseTotal.value < HOUSE_STAYS) {
      dealToHouse();
    }
  }
}

const handIsBust = (hand: TDeck): boolean => PlayingCards.totalHand(hand) > 21;

const handWins = (hand: TDeck): boolean => {
  if (hasHouseRevealed.value) {
    const handTotal = PlayingCards.totalHand(hand);

    return PlayingCards.hasBlackjack(hand) ||
        (handTotal <= 21 && handTotal > houseTotal.value);
  }

  return false;
};

const isEligibleForSplit = (hand: TDeck): boolean => hand.length === 2 && hand[0] === hand[1];

const removePlayer = (player: IPlayer) => {
  const playerIndex = players.value.findIndex(p => p.uuid === player.uuid);

  players.value.splice(playerIndex, 1);
  delete playerHandsMap.value[player.uuid];

  Session.saveGameSession({
    'players': players.value,
  });
};

const reshuffleDrawDeck = () => {
  if (drawDeck.value.length === 0) {
    drawDeck.value = PlayingCards.shuffleDeck(PlayingCards.generateDeck());
  } else {
    drawDeck.value = PlayingCards.shuffleDeck(discardDeck.value);
    discardDeck.value.length = 0;
  }
  Session.saveGameSession({'drawDeck': drawDeck.value});
}

const revealHouseHand = () => {
  houseHand.value.forEach(card => { card.facing = 'up'; });
  hasHouseRevealed.value = true;
}

const setPlayerName = (player: IPlayer, newName: string) => {
  if (newName) {
    const playerIndex = players.value.findIndex(p => p.uuid === player.uuid);
    players.value[playerIndex].name = newName;
    Session.saveGameSession({'players': players.value});
  }
};

const splitHand = (player: IPlayer) => {
  console.log(`TODO: split hand for ${player.name}`);
};

const stayPlayer = (player: IPlayer) => {
  stayedPlayerIDs.value.push(player.uuid);
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

    <section class="house">
      <CardHolder
          @click.stop="dealToHouse"
          :bust="handIsBust(houseHand)"
          :total="hasHouseRevealed ? PlayingCards.totalHand(houseHand) : -1"
          :win="houseWins"
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
            v-for="card in houseHand"
            :key="card.id"
            :card="card"
            random-layout
            @card-reveal="hasHouseRevealed = true"
        ></Card>
      </CardHolder>
    </section>

<!-- TODO: allow d&d sorting -->
<!-- TODO: allow pinning -->
<!-- TODO: allow swap in/out groups of players -->
    <section class="players">
      <CardHolder
          v-for="player in players"
          :key="player.uuid"
          @click.stop="dealToPlayer(player)"
          :bust="handIsBust(playerHandsMap[player.uuid])"
          :total="PlayingCards.totalHand(playerHandsMap[player.uuid])"
          :win="handWins(playerHandsMap[player.uuid])"
      >
        <template v-slot:header>
          <!-- TODO: move player controls to ellipsis menu -->
          <RenameDialog @update="(evt, name) => setPlayerName(player, name)"></RenameDialog>
          <v-btn
              text="Remove"
              @click.stop="removePlayer(player)"
              :disabled="players.length <= 1"
          ></v-btn>
          <div class="player-name">{{ player.name }}</div>
        </template>
        <Card
            v-for="card in playerHandsMap[player.uuid]"
            :key="PlayingCards.getCardID(card)"
            :card="card"
            random-layout
        ></Card>
        <template v-slot:side>
          <div class="stay">
            <v-btn v-if="!stayedPlayerIDs.includes(player.uuid)" text="Stay" @click.stop="stayPlayer(player)"></v-btn>
            <v-icon v-else class="stay-icon" icon="mdi-hand-front-right" size="small" color="red"></v-icon>
          </div>
          <v-btn
              v-if="isEligibleForSplit(playerHandsMap[player.uuid])"
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
  flex: 1 0 0;
  overflow-x: clip;
  text-overflow: ellipsis;
}
.stay > * {
  display: inline;
}
</style>
