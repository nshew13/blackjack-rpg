<script setup lang="ts">
import {computed, onBeforeMount, reactive, ref, shallowReactive, toRaw, watch, watchEffect} from 'vue';
import {toRawDeep} from '@/utilities/toRawDeep';
import CardStandard from '@/components/CardStandard.vue';
import CardHolder from '@/components/CardHolder.vue';
import ConfirmationDialog from '@/components/controls/ConfirmationDialog.vue';
import CardDeck from '@/components/CardDeck.vue';
import PlayerAddToGroup from '@/components/controls/PlayerAddToGroup.vue';
import PlayerGroupDropdown from '@/components/controls/PlayerGroupDropdown.vue';
import PlayerName from '@/components/controls/PlayerName.vue';
import PlayerRemove from '@/components/controls/PlayerRemove.vue';
import PlayerToggle from '@/components/controls/PlayerToggle.vue';
import {Blackjack, type THandTotal} from '@/utilities/Blackjack';
import {Session} from '@/utilities/Session';
import type {IPlayer, IPlayerGroup} from '@/types/IPlayer';
import type {Ref} from 'vue';
// import type {SessionStore} from '@/utilities/Session';
import type {TCardFacing, TDeck} from '@/utilities/PlayingCards';

type TCardHolderMap = Record<string /* IPlayer.uuid */, TDeck>;
type TPlayerID = IPlayer['uuid'];

const HOUSE_STANDS = 17;
let nextPlayerNumber = 1;
const blackjack = new Blackjack();

//
//
// REF and COMPUTED
//

const drawDeck = reactive<TDeck>([]);
const discardDeck = reactive<TDeck>([]);
const players = reactive<IPlayer[]>([]);
const playerGroups = reactive<IPlayerGroup[]>([]);

const selectedGroupID = ref<IPlayerGroup['uuid']>();
const hasHouseRevealed = ref<boolean>(false);
const houseWins = ref<boolean>(false);
const showConfirmHouse = ref<boolean>(false);

const blackjackPlayerIDs = shallowReactive<Set<TPlayerID>>(new Set());
const bustedPlayerIDs = shallowReactive<Set<TPlayerID>>(new Set());
const standingPlayerIDs = shallowReactive<Set<TPlayerID>>(new Set());
const winningPlayerIDs = shallowReactive<Set<TPlayerID>>(new Set());


/**
 * a reactive map of player UUIDs to TDecks
 */
const playerHandsMap: Ref<TCardHolderMap> = ref({});
const houseHand: Ref<TDeck> = ref([]);

const allPlayersAreBust = computed((): boolean => {
    return playerHands.value.every(hand => blackjack.handIsBust(hand));
});

const enabledPlayers = computed((): Array<IPlayer> => {
    // do we have groups defined
    if(playerGroups.length > 0 && selectedGroupID.value) {
        return players.filter(p => p.enabled);
    }

    return players;
});

const hasDealtCards = computed((): boolean => {
    if(houseHand.value.length > 0) {
        return true;
    }

    // TODO: check all enabled instead of some of all
    return playerHands.value.some(hand => hand.length > 0);
});

const houseHasBlackjack = computed((): boolean => blackjack.handHasBlackjack(houseHand.value));

const houseIsBust = computed((): boolean => blackjack.handIsBust(houseHand.value));

const houseTotal = computed((): THandTotal => blackjack.totalHand(houseHand.value));

const playerHands = computed((): Array<TDeck> => {
    if(typeof playerHandsMap.value === 'undefined') {
        return [];
    }

    return Object.values(playerHandsMap.value);
});

const selectedGroup = computed((): IPlayerGroup | undefined => {
    return playerGroups.find(g => g.uuid === selectedGroupID.value);
});

const sortedPlayers = computed((): Array<IPlayer> => {
    return players.toSorted((a: IPlayer, b: IPlayer) => {
        if(a.enabled === b.enabled) {
            // if both enabled, sort by name
            if(a.name === b.name) {
                return 0;
            }

            return a.name < b.name ? -1 : 1;
        }

        return a.enabled ? -1 : 1;
    });
});

const unfinishedPlayerIDs = computed((): Array<IPlayer['uuid']> => {
    return players.filter((player) => {
        return (
            !blackjackPlayerIDs.has(player.uuid) &&
            !bustedPlayerIDs.has(player.uuid) &&
            !standingPlayerIDs.has(player.uuid) &&
            !winningPlayerIDs.has(player.uuid)
        );
    }).map((player) => player.uuid);
});


//
//
// WATCHES (non-immediate) and LIFECYCLE HOOKS
//

// watch all player hands for status changes (blackjack, win, bust)
// house hands have computed values
watch([playerHandsMap, hasHouseRevealed, houseIsBust], () => {
    /*
     * If the House has gone bust, we don't need to reset player
     * status and re-evaluate each player. As long as the player
     * isn't bust, mark him as winning.
     */
    if(houseIsBust.value) {
        unfinishedPlayerIDs.value.forEach((playerID) => {
            winningPlayerIDs.add(playerID);
        });

        return;
    }

    // TODO: need to mark losing hands
    // TODO: add status to IPlayer, but just win/lose
    //       extend in Blackjack with bust, bj, stand

    resetPlayerStatuses();
    Object.keys(playerHandsMap.value).forEach(playerID => {
        const hand = playerHandsMap.value[playerID]; // shortcut

        // only consider ready hands
        if(hand.length >= 2) {
            /*
             * handHasBlackjack is a subset of handWins, but handWins
             * isn't calculated until hasHouseRevealed. Instead,
             * consider it separately.
             *
             * Players with a blackjack will not show as winners
             * until the house reveals.
             */
            if(blackjack.handHasBlackjack(hand)) {
                blackjackPlayerIDs.add(playerID);
                standingPlayerIDs.add(playerID);
            }

            if(blackjack.handIsBust(hand)) {
                bustedPlayerIDs.add(playerID);
            } else if(handWins(hand)) { // includes blackjack
                winningPlayerIDs.add(playerID);
            }
        }
    });
}, {deep: true});

watch(allPlayersAreBust, () => {
    if(allPlayersAreBust.value) {
        houseWins.value = true;
        revealHouseHand();
    }
});

watch(standingPlayerIDs, () => {
    if(standingPlayerIDs.size === playerHands.value.length) {
        completeHouseHand();
    }
}, {deep: true});

// switch to just-created group
watch(() => playerGroups.length, (newLength, oldLength) => {
    if(newLength > (oldLength ?? 0)) {
        const newestGroup = playerGroups[newLength - 1];
        selectedGroupID.value = newestGroup.uuid;
    }
});

// TODO: animate dis/enabling
// activate a group of players, deactivate other groups
watch(selectedGroupID, (newGroupID, oldGroupID) => {
    if(newGroupID && newGroupID !== oldGroupID) {
        players.forEach(player => {
            player.enabled = player?.inGroup === newGroupID;
        });
    }
});

onBeforeMount(() => {
    // load from saved state
    // const state: SessionStore = Session.loadGameSession();

    drawDeck.splice(0, Infinity, /*state?.drawDeck ??*/ ...blackjack.shuffleDeck(blackjack.generateDeck()));

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
    if(typeof uuid === 'undefined') {
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
    if(selectedGroupID.value) {
        newPlayer.inGroup = selectedGroupID.value;
    }

    players.push(newPlayer);

    if(!skipSave) {
        Session.saveGameSession({
            'players': players,
        });
    }
};

const dealInitialHands = () => {
    if(hasDealtCards.value) {
        discardAll();
    }

    hasHouseRevealed.value = false;
    houseWins.value = false;

    // deal one to each enabled player
    enabledPlayers.value.forEach(player => {
        dealToPlayer(player);
    });

    // deal House's first card face down
    dealToHouse(true, 'down');

    // deal second card to each player
    enabledPlayers.value.forEach(player => {
        dealToPlayer(player);
    });

    // deal House's second card face up
    dealToHouse(true);

    // reveal if dealer has blackjack
    if(blackjack.handHasBlackjack(houseHand.value)) {
        revealHouseHand();
    }

    // TODO: move save session calls into watch(es)
    Session.saveGameSession({'drawDeck': drawDeck});
};

const dealTo = (hand: TDeck, facing: TCardFacing = 'up') => {
    if(drawDeck.length === 0) {
        reshuffleDrawDeck();
    }

    // TODO: is this necessary?
    if(blackjack.handIsBust(hand)) {
        console.log('Hand is bust. I cannot even deal.');
        return;
    }

    const nextCard = blackjack.getTopCard(drawDeck);

    if(nextCard) {
        hand.push(nextCard);
        /*
         * Prior to adding the deck number to the ID, changing the
         * facing would update all cards in the draw deck matching
         * this suit-value pair.
         */
        nextCard.facing = facing;
    } else {
        throw new Error('Insufficient cards.');
    }

    // Session.saveGameSession({ 'drawDeck': drawDeck });
};

const dealToHouse = (skipWarning = false, facing: TCardFacing = 'up') => {
    if(!skipWarning && !hasHouseRevealed.value) {
        // warn before revealing
        // TODO: make this optional/configurable
        showConfirmHouse.value = true;
    } else if(!houseWins.value) {
        dealTo(houseHand.value, facing);
    }
};

// TODO: add turn over animation
// TODO: add movement to card holder (hand)
const dealToPlayer = (player: IPlayer) => {
    if(
        standingPlayerIDs.has(player.uuid) ||
        !player.enabled ||
        hasHouseRevealed.value
    ) {
        return;
    }

    const hand = playerHandsMap.value[player.uuid];
    dealTo(hand);
};

const discardAll = () => {
    discardHand(houseHand.value);
    playerHands.value.forEach(hand => discardHand(hand));
    resetPlayerStatuses();
};

const discardHand = (hand: TDeck) => {
    discardDeck.splice(-1, 0, ...hand);
    hand.length = 0;
};

const completeHouseHand = () => {
    if(!hasHouseRevealed.value) {
        revealHouseHand();

        if(!Array.isArray(houseTotal.value)) {
            while(houseTotal.value < HOUSE_STANDS) {
                dealToHouse();
            }
        } else {
            while(houseTotal.value[0] < HOUSE_STANDS) {
                dealToHouse();
            }
        }
    }
};

const handWins = (hand: TDeck): boolean => {
    if(hasHouseRevealed.value) {
        let handTtl: THandTotal = blackjack.totalHand(hand);
        let houseTtl: THandTotal = houseTotal.value;

        // assume player and house stand at higher total, if multiple
        if(Array.isArray(handTtl)) {
            handTtl = handTtl[0];
        }
        if(Array.isArray(houseTtl)) {
            houseTtl = houseTtl[0];
        }

        return blackjack.handHasBlackjack(hand) ||
            (handTtl <= 21 && handTtl > houseTtl);
    }

    return false;
};

const isEligibleForSplit = (hand: TDeck): boolean => hand.length === 2 && hand[0] === hand[1];

const removePlayer = (player: IPlayer) => {
    const playerIndex = players.findIndex(p => p.uuid === player.uuid);

    players.splice(playerIndex, 1);
    discardHand(playerHandsMap.value[player.uuid]);
    delete playerHandsMap.value[player.uuid];

    Session.saveGameSession({
        'players': players,
    });
};

const resetPlayerStatuses = () => {
    standingPlayerIDs.clear();
    blackjackPlayerIDs.clear();
    bustedPlayerIDs.clear();
    winningPlayerIDs.clear();
};

const reshuffleDrawDeck = () => {
    // only allow reshuffle if draw deck is empty
    if(drawDeck.length === 0) {
        // we can only shuffle from the discard pile
        if(discardDeck.length > 0) {
            console.debug(`Reshuffling ${discardDeck.length} cards from the discard pile.`);
            drawDeck.splice(0, Infinity, ...blackjack.shuffleDeck(toRawDeep(discardDeck)));
            discardDeck.length = 0;
        } else {
            drawDeck.splice(0, Infinity, ...blackjack.shuffleDeck(blackjack.generateDeck()));
            // throw new Error('No cards available to reshuffle.');
        }
    }

    Session.saveGameSession({'drawDeck': drawDeck});
};

const revealHouseHand = () => {
    houseHand.value.forEach(card => {
        card.facing = 'up';
    });
    hasHouseRevealed.value = true;
};

const showGroup = (group: IPlayerGroup) => {
    selectedGroupID.value = group.uuid;
};

const splitHand = (player: IPlayer) => {
    console.log(`TODO: split hand for ${player.name}`);
};

const standPlayer = (player: IPlayer) => {
    if(hasHouseRevealed.value) {
        return;
    }

    standingPlayerIDs.add(player.uuid);
};

const updatePlayer = (updatedPlayer: IPlayer) => {
    const clonedPlayer = structuredClone(toRaw(updatedPlayer));
    const playerIndex = players.findIndex(p => p.uuid === clonedPlayer.uuid);

    // if adding player to active group, make sure the player is enabled
    clonedPlayer.enabled = (playerGroups.length > 0 &&
        typeof selectedGroupID.value !== 'undefined' &&
        typeof clonedPlayer?.inGroup !== 'undefined' &&
        clonedPlayer.inGroup === selectedGroupID.value
    );

    players[playerIndex] = clonedPlayer;
    Session.saveGameSession({'players': players});
};


//
//
// WATCHES (immediate) and WATCHEFFECTS
//

/**
 * fires when all enabled players are standing or bust
 */
watchEffect(() => {
    const numStanding = standingPlayerIDs.size;
    const numBust = playerHands.value.filter(hand => blackjack.handIsBust(hand)).length;

    if(enabledPlayers.value.length > 0 &&
        numStanding + numBust === enabledPlayers.value.length
    ) {
        completeHouseHand();
    }
});
</script>

<template>
  <div class="table">
    <ConfirmationDialog
      :show-dialog="showConfirmHouse"
      message="Do you want to reveal the House's hand?"
      @ok="revealHouseHand"
      @close="showConfirmHouse = false"
    />

    <section class="decks">
      <CardHolder
        label="Draw"
        class="draw-deck"
        single-column
      >
        <CardDeck
          v-model="drawDeck"
          @reshuffle="reshuffleDrawDeck"
        />

        <template #actions>
          <div class="draw-deck-count">
            {{ drawDeck.length }} remaining
          </div>
          <q-btn
            v-if="drawDeck.length <= 0"
            label="Shuffle"
            @click.stop="reshuffleDrawDeck"
          />
        </template>
      </CardHolder>

      <!-- TODO: bulk add to group -->
      <div class="main-actions">
        <q-btn
          label="Add Player"
          icon="person_add"
          @click.stop="() => addPlayer()"
        />
        <q-btn
          :label="hasDealtCards ? 'Discard All &amp; Deal' : 'Deal'"
          icon="autorenew"
          @click.stop="dealInitialHands"
        />
        <q-btn
          :disabled="!hasDealtCards"
          label="Discard All"
          icon="delete_sweep"
          @click.stop="discardAll"
        />
        <PlayerGroupDropdown
          help-text="Select group to enable"
          :label="selectedGroup && selectedGroup.name"
          :player-groups="playerGroups"
          @select="showGroup"
        />
      </div>

      <CardHolder
        label="Discard"
        class="discard-pile"
        single-column
      >
        <CardDeck
          v-model="discardDeck"
          facing="up"
        />
      </CardHolder>
    </section>

    <section class="hands">
      <!-- House -->
      <CardHolder
        :bust="houseIsBust"
        :total="hasHouseRevealed ? blackjack.totalHand(houseHand) : void 0"
        :win="houseHasBlackjack || houseWins"
        card-size="small"
        @deal="dealToHouse"
      >
        <!-- TODO: win isn't always working -->
        <template #header>
          <div class="player-name">
            House
          </div>
          <q-btn
            label="Finish Hand"
            :disabled="!(hasDealtCards && !hasHouseRevealed)"
            @click.stop="completeHouseHand"
          />
        </template>
        <template #default="{ cardSize }">
          <template
            v-for="(card, index) in houseHand"
            :key="card.id"
          >
            <CardStandard
              v-model="houseHand[index]"
              :card-size="cardSize"
              random-layout
              @card-reveal="revealHouseHand"
            />
          </template>
        </template>
      </CardHolder>

      <!-- TODO: allow d&d sorting -->
      <!-- TODO: allow pinning -->
      <!-- players -->
      <CardHolder
        v-for="player in sortedPlayers"
        :key="player.uuid"
        card-size="small"
        :bust="bustedPlayerIDs.has(player.uuid)"
        :disable="!player.enabled"
        :total="blackjack.totalHand(playerHandsMap[player.uuid])"
        :win="winningPlayerIDs.has(player.uuid)"
        @deal="dealToPlayer(player)"
      >
        <template #header>
          <PlayerName
            :player="player"
            @rename="updatePlayer"
          />
          <PlayerAddToGroup
            v-model="playerGroups"
            :player="player"
            @update:player="updatePlayer"
          />
          <PlayerToggle
            v-model="player.enabled"
            :player="player"
          />
          <PlayerRemove
            :player="player"
            :players-count="sortedPlayers.length"
            :disable="players.length <= 1"
            @remove="removePlayer"
          />
        </template>
        <template #default="{ cardSize }">
          <template
            v-for="(card, index) in playerHandsMap[player.uuid]"
            :key="card.id"
          >
            <CardStandard
              v-model="playerHandsMap[player.uuid][index]"
              :card-size="cardSize"
              random-layout
            />
          </template>
        </template>
        <template #side>
          <div
            v-if="hasDealtCards"
            class="stand"
          >
            <q-btn
              v-if="!standingPlayerIDs.has(player.uuid)"
              label="Stand"
              @click.stop="standPlayer(player)"
            />
            <q-icon
              v-else
              class="stand-icon"
              name="front_hand"
              color="red"
            />
          </div>
          <q-btn
            v-if="isEligibleForSplit(playerHandsMap[player.uuid])"
            label="Split"
            @click.stop="splitHand(player)"
          />
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
    <Deck :cards="splitDeck" />
    </CardHolder>
    -->
  </div>
</template>

<style scoped>
.decks {
    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 2em;
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

.stand {
    min-height: 54px; /* accommodate small icon */
}

.stand > * {
    display: inline;
}
</style>
