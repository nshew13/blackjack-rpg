<script setup lang="ts">
import {PlayingCardUtils} from '@/utilities/PlayingCardUtils';
import type {TCardSuit} from '@/utilities/PlayingCards';

const props = defineProps<{
    suit: TCardSuit,
}>();
</script>

<template>
  <div class="suit-symbol" v-html="PlayingCardUtils.getHtmlEntity(props.suit)"></div>
</template>
