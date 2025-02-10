<script setup lang="ts">
import {computed} from 'vue';
import CardStandard from '@/components/CardStandard.vue';
import type {ICard, TCardFacing, TDeck} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
    // N.B.: a watch on cards will stop if/when the array is replaced with a new array (e.g., during reshuffle)
    facing?: TCardFacing,
}>(), {
    facing: 'down',
});

const cards = defineModel<TDeck>({required: true});

const topCard = computed((): ICard | false => {
    if (cards.value?.length > 0) {
        if (props.facing === 'up') {
            return cards.value[cards.value.length - 1];
        }
        return cards.value[0];
    }

    return false;
});

const emit = defineEmits<{
    (e: 'click', event: Event, card: ICard): void
}>();

const emitCardClick = (event: Event) => {
    if (cards.value.length > 0) {
        emit('click', event, <ICard>cards.value.shift());
    } else {
        console.debug('deck is empty');
    }
};
</script>

<template>
  <div class="deck" @click.stop="emitCardClick">
    <CardStandard v-if="topCard" v-model="topCard" />
  </div>
</template>
