<script setup lang="ts">
import {computed, onBeforeMount, ref, watch} from 'vue';
import Card from '@/components/Card.vue';
import CardHolder from '@/components/CardHolder.vue';
import ConfirmationDialog from '@/components/controls/ConfirmationDialog.vue';
import Deck from '@/components/Deck.vue';
import PlayerAddToGroup from '@/components/controls/PlayerAddToGroup.vue';
import PlayerGroupDropdown from '@/components/controls/PlayerGroupDropdown.vue';
import PlayerName from '@/components/controls/PlayerName.vue';
import PlayerRemove from '@/components/controls/PlayerRemove.vue';
import PlayerToggle from '@/components/controls/PlayerToggle.vue';
import {PlayingCards} from '@/utilities/PlayingCards';
import {Session} from '@/utilities/Session';
import type {IPlayer, IPlayerGroup} from '@/types/IPlayer';
import type {Ref} from 'vue';
// import type {SessionStore} from '@/utilities/Session';
import type {TCardFacing, TDeck} from '@/utilities/PlayingCards';

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
const playerGroups = ref<IPlayerGroup[]>([]);
const selectedGroupID = ref<IPlayerGroup['uuid']>();

const hasHouseRevealed = ref<boolean>(false);
const houseWins = ref<boolean>(false);
const showConfirmHouse = ref<boolean>(false);
const stayedPlayerIDs = ref<string[]>([]);

/**
 * a reactive map of player UUIDs to TDecks
 */
const playerHandsMap: Ref<TCardHolderMapRef> = ref({});
const houseHand: Ref<TDeck> = ref([]);

const allPlayersAreFinished = computed((): boolean => {
    return stayedPlayerIDs.value.length + playerHands.value.filter(hand => handIsBust(hand)).length === playerHands.value.length;
});

const allPlayersAreBust = computed((): boolean => {
    return playerHands.value.every(hand => handIsBust(hand));
});

const enabledPlayers = computed((): Array<IPlayer> => {
    // do we have groups defined
    if (playerGroups.value.length > 0 && selectedGroupID.value) {
        return players.value.filter(p => p.enabled);
    }

    return players.value;
});

const hasDealtCards = computed((): boolean => {
    if (houseHand.value.length > 0) {
        return true;
    }

    return playerHands.value.some(hand => hand.length > 0);
});

const houseHasBlackjack = computed((): boolean => PlayingCards.hasBlackjack(houseHand.value));

const houseIsBust = computed((): boolean => handIsBust(houseHand.value));

const houseTotal = computed((): number => PlayingCards.totalHand(houseHand.value));

const playerHands = computed((): Array<TDeck> => {
    if (typeof playerHandsMap.value === 'undefined') {
        return [];
    }

    return Object.values(playerHandsMap.value);
});

const selectedGroup = computed((): IPlayerGroup | undefined => {
    return playerGroups.value.find(g => g.uuid === selectedGroupID.value);
});

const sortedPlayers = computed((): Array<IPlayer> => {
    return players.value.toSorted((a: IPlayer, b: IPlayer) => {
        if (a.enabled === b.enabled) {
            // if both enabled, sort by name
            if (a.name === b.name) {
                return 0;
            }

            return a.name < b.name ? -1 : 1;
        }

        return a.enabled ? -1 : 1;
    });
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

watch(stayedPlayerIDs, () => {
    if (stayedPlayerIDs.value.length === playerHands.value.length) {
        completeHouseHand();
    }
}, { deep: true });

watch(allPlayersAreFinished, () => {
    if (allPlayersAreFinished.value) {
        completeHouseHand();
    }
});

// switch to first created group
const stopWatchPlayerGroups = watch(playerGroups, () => {
    if (playerGroups.value.length === 1) {
        selectedGroupID.value = playerGroups.value[0].uuid;
        stopWatchPlayerGroups();
    }
}, { deep: true });

// TODO: animate dis/enabling
watch(selectedGroupID, (newGroupID, oldGroupID) => {
    if (newGroupID && newGroupID !== oldGroupID) {
        players.value.forEach(player => {
            player.enabled = player?.inGroup === newGroupID;
        });
    }
});

onBeforeMount(() => {
    // load from saved state
    // const state: SessionStore = Session.loadGameSession();

  drawDeck.value = state?.drawDeck ?? PlayingCards.shuffleDeck(PlayingCards.generateDeck());

    // if (Array.isArray(state?.players)) {
    //   // N.B.: Because forEach iterates over the original array, add+save doesn't get stuck in a loop here.
    //   state.players.forEach(player => { addPlayer(player, true); });
    // } else {
    // No stored players. Create one.
    addPlayer();
    // }
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

    const newPlayer: IPlayer = {
        enabled: true,
        name: player?.name ?? `Player ${playerNumber}`,
        uuid,
    };

    // add to selected group, if defined
    if (selectedGroupID.value) {
        newPlayer.inGroup = selectedGroupID.value;
    }

    players.value.push(newPlayer);

    if (!skipSave) {
        Session.saveGameSession({
            'players': players.value,
        });
    }
};

const dealInitialHands = () => {
    if (hasDealtCards.value) {
        discardAll();
    }

    hasHouseRevealed.value = false;
    houseWins.value = false;

    // deal one to each enabled player
    enabledPlayers.value.forEach(player => { dealToPlayer(player); });

    // deal House's first card face down
    dealToHouse(true, 'down');

    // deal second card to each player
    enabledPlayers.value.forEach(player => { dealToPlayer(player); });

    // deal House's second card face up
    dealToHouse(true);

    // reveal if dealer has blackjack
    if (PlayingCards.hasBlackjack(houseHand.value)) {
        revealHouseHand();
    }

    // TODO: move save session calls into watch(es)
    Session.saveGameSession({ 'drawDeck': drawDeck.value });
};

const dealTo = (hand: TDeck, facing: TCardFacing = 'up') => {
    if (drawDeck.value.length === 0) {
        reshuffleDrawDeck();
    }

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

    Session.saveGameSession({ 'drawDeck': drawDeck.value });
};

const dealToHouse = (skipWarning = false, facing: TCardFacing = 'up') => {
    if (!skipWarning && !hasHouseRevealed.value) {
        // warn before revealing
        // TODO: make this optional/configurable
        showConfirmHouse.value = true;
    } else {
        dealTo(houseHand.value, facing);
    }
};

// TODO: add turn over animation
// TODO: add movement to card holder (hand)
const dealToPlayer = (player: IPlayer) => {
    if (stayedPlayerIDs.value.includes(player.uuid)) {
        return;
    }

    const hand = playerHandsMap.value[player.uuid];
    dealTo(hand);
};

const discardAll = () => {
    discardHand(houseHand.value);
    playerHands.value.forEach(hand => discardHand(hand));
    stayedPlayerIDs.value.length = 0;
};

const discardHand = (hand: TDeck) => {
    discardDeck.value = discardDeck.value.concat(hand);
    hand.length = 0;
};

const completeHouseHand = () => {
    if (!hasHouseRevealed.value) {
        revealHouseHand();
        while (houseTotal.value < HOUSE_STAYS) {
            dealToHouse();
        }
        // TODO: compare scores to see if house wins
    }
};

const handIsBust = (hand: TDeck): boolean => PlayingCards.totalHand(hand) > 21;

// TODO: should player w/BJ automatically stay?
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
    discardHand(playerHandsMap.value[player.uuid]);
    delete playerHandsMap.value[player.uuid];

    Session.saveGameSession({
        'players': players.value,
    });
};

const reshuffleDrawDeck = () => {
    // only allow reshuffle if draw deck is empty
    if (drawDeck.value.length === 0) {
        // we can only shuffle from the discard pile
        if (discardDeck.value.length > 0) {
            console.debug(`Reshuffling ${discardDeck.value.length} cards from the discard pile.`);
            drawDeck.value = PlayingCards.shuffleDeck(discardDeck.value);
            discardDeck.value.length = 0;
        } else {
            throw new Error('No cards available to reshuffle.');
        }
    }

    Session.saveGameSession({ 'drawDeck': drawDeck.value });
};

const revealHouseHand = () => {
    houseHand.value.forEach(card => { card.facing = 'up'; });
    hasHouseRevealed.value = true;
};

const showGroup = (group: IPlayerGroup) => {
    selectedGroupID.value = group.uuid;
};

const splitHand = (player: IPlayer) => {
    console.log(`TODO: split hand for ${player.name}`);
};

const stayPlayer = (player: IPlayer) => {
    stayedPlayerIDs.value.push(player.uuid);
};

const updatePlayer = (updatedPlayer: IPlayer) => {
    console.log('updated player', JSON.parse(JSON.stringify(updatedPlayer)));
    const playerIndex = players.value.findIndex(p => p.uuid === updatedPlayer.uuid);
    players.value[playerIndex] = JSON.parse(JSON.stringify(updatedPlayer));
    Session.saveGameSession({ 'players': players.value });
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

        <template #actions v-if="drawDeck.length <= 0">
          <q-btn label="Shuffle" @click.stop="reshuffleDrawDeck"></q-btn>
        </template>
      </CardHolder>

      <!-- TODO: bulk add to group -->
      <!-- TODO: remove from/change group -->
      <div class="main-actions">
        <q-btn label="Add Player" icon="person_add" @click.stop="() => addPlayer()"></q-btn>
        <q-btn :label="hasDealtCards ? 'Discard All &amp; Deal' : 'Deal'" icon="autorenew" @click.stop="dealInitialHands"></q-btn>
        <q-btn label="Discard All" icon="delete_sweep" @click.stop="discardAll" :disabled="!hasDealtCards"></q-btn>
        <PlayerGroupDropdown
            help-text="Select group to enable"
            :label="selectedGroup && selectedGroup.name"
            :player-groups="playerGroups"
            @select="showGroup"
        ></PlayerGroupDropdown>
      </div>

      <CardHolder label="Discard" class="discard-pile" single-column>
        <Deck :cards="discardDeck" facing="up"></Deck>
      </CardHolder>
    </section>

    <section class="hands">
      <!-- House -->
      <CardHolder
          @deal="dealToHouse"
          :bust="handIsBust(houseHand)"
          card-size="small"
          :total="hasHouseRevealed ? PlayingCards.totalHand(houseHand) : -1"
          :win="houseHasBlackjack || houseWins"
      >
        <template #header>
          <div class="player-name">House</div>
          <q-btn
              label="Finish Hand"
              :disabled="!(hasDealtCards && !hasHouseRevealed)"
              @click.stop="completeHouseHand"
          ></q-btn>
        </template>
        <template #default="{ cardSize }">
          <Card
              v-for="card in houseHand"
              :key="card.id"
              :card="card"
              :card-size="cardSize"
              random-layout
              @card-reveal="hasHouseRevealed = true"
          ></Card>
        </template>
      </CardHolder>

      <!-- TODO: allow d&d sorting -->
      <!-- TODO: allow pinning -->
      <!-- TODO: allow swap in/out groups of players -->
      <!-- players -->
      <CardHolder
          v-for="player in sortedPlayers"
          :key="player.uuid"
          card-size="small"
          :bust="handIsBust(playerHandsMap[player.uuid])"
          :disable="!player.enabled"
          :total="PlayingCards.totalHand(playerHandsMap[player.uuid])"
          :win="handWins(playerHandsMap[player.uuid]) || (houseIsBust && !handIsBust(playerHandsMap[player.uuid]))"
          @deal="dealToPlayer(player)"
      >
        <template #header>
          <PlayerName :player="player" @rename="updatePlayer"></PlayerName>
          <PlayerAddToGroup :player="player" v-model="playerGroups" @update:player="updatePlayer"></PlayerAddToGroup>
          <PlayerToggle :player="player" v-model="player.enabled"></PlayerToggle>
          <PlayerRemove :player="player" :disable="players.length <= 1" @remove="removePlayer"></PlayerRemove>
        </template>
        <template #default="{ cardSize }">
          <Card
              v-for="card in playerHandsMap[player.uuid]"
              :key="PlayingCards.getCardID(card)"
              :card="card"
              :card-size="cardSize"
              random-layout
          ></Card>
        </template>
        <template #side>
          <div class="stay">
            <q-btn v-if="!stayedPlayerIDs.includes(player.uuid)" label="Stay" @click.stop="stayPlayer(player)"></q-btn>
            <q-icon v-else class="stay-icon" name="front_hand" color="red"></q-icon>
          </div>
          <q-btn
              v-if="isEligibleForSplit(playerHandsMap[player.uuid])"
              label="Split"
              @click.stop="splitHand(player)"
          ></q-btn>
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
  justify-content: center;
}

.main-actions {
  align-self: stretch;

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.hands {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.player-name,
:deep(.player-name) {
  flex: 1 0 0;
}

.stay {
  min-height: 54px; /* accommodate small icon */
}

.stay > * {
  display: inline;
}
</style>
