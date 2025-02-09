<script setup lang="ts">
import {computed, ref, toRaw, watchEffect} from 'vue';
import CardStandard from '@/components/CardStandard.vue';
import type {ICard, TCardFacing, TDeck} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
    // N.B.: a watch on cards will stop if/when the array is replaced with a new array (e.g., during reshuffle)
    cards: TDeck,
    facing?: TCardFacing,
}>(), {
    facing: 'down',
});

const cardsInternal = ref<TDeck>([]);
watchEffect(() => {
    try {
        cardsInternal.value = structuredClone(toRaw(props.cards));
    } catch (e) {
        console.error(e);
    }
});

const topCard = computed((): ICard | false => {
    if (cardsInternal.value?.length > 0) {
        if (props.facing === 'up') {
            return cardsInternal.value[cardsInternal.value.length - 1];
        }
        return cardsInternal.value[0];
    }

    return false;
});

const emit = defineEmits<{
    (e: 'click', event: Event, card: ICard): void
}>();

const emitCardClick = (event: Event) => {
    if (cardsInternal.value.length > 0) {
        emit('click', event, <ICard>cardsInternal.value.shift());
    } else {
        console.debug('deck is empty');
    }
};
</script>

<template>
  <div class="deck" @click.stop="emitCardClick">
    <CardStandard v-if="topCard" :card="topCard"></CardStandard>
  </div>
</template>
