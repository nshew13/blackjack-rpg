<script setup lang="ts">
import {PlayingCardUtils} from '@/utilities/PlayingCardUtils';
import type {TCardSuit} from '@/utilities/PlayingCards';

const props = defineProps<{
    suit: TCardSuit,
}>();
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- input is controlled -->
  <div
    class="suit-symbol"
    v-html="PlayingCardUtils.getHtmlEntity(props.suit)"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>
