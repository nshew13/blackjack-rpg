<script setup lang="ts">
import {PlayingCards} from '@/utilities/PlayingCards';
import type {TCardSuit} from '@/utilities/PlayingCards';

const props = defineProps<{
    suit: TCardSuit,
}>();
</script>

<template>
  <div class="suit-symbol" v-html="PlayingCards.getHtmlEntity(props.suit)"></div>
</template>
