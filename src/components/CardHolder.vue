<script setup lang="ts">
import {computed} from 'vue';
import type {TCardSize} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
    bust?: boolean,
    cardSize?: TCardSize,
    disable?: boolean,
    label?: string,
    singleColumn?: boolean,
    total?: number,
    win?: boolean,
}>(), {
    bust: false,
    cardSize: 'large',
    disable: false,
    label: '',
    singleColumn: false,
    win: false,
});

const emit = defineEmits<{
    (e: 'deal'): void,
}>();

const headerAlign = computed(() => props.singleColumn ? 'center' : 'stretch');

const cardHeight = computed(() => {
    switch (props.cardSize) {
        case 'large':
        default:
            return '150px';

        case 'small':
            return '90px';
    }
});

const cardPadding = computed(() => {
    switch (props.cardSize) {
        case 'large':
        default:
            return '10px';

        case 'small':
            return '0';
    }
});

const showTotal = typeof props?.total !== 'undefined';
</script>

<template>
  <div class="card-holder" :class="{ 'win': win, 'disable': disable }">
    <div class="header">
      <slot name="header">{{ label }}</slot>
    </div>

    <div class="card-row">
      <div class="card-area" :class="{'single-column': singleColumn}" @click.stop="emit('deal')">
        <slot :card-size="cardSize">
          <!-- expected <Card>(s) or <Deck> -->
        </slot>
        <svg v-if="bust" class="bust" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
             viewBox="0 0 100 100">
          <path d="M0 0 L100 100" />
          <path d="M0 100 L100 0" />
        </svg>
      </div>
      <div v-if="showTotal" class="area-total">
        <span class="total-label">Total</span>
        <span>{{ total && total < 0 ? '--' : total }}</span>
        <slot name="side"></slot>
      </div>
    </div>

    <slot v-if="$slots.actions" name="actions"></slot>
  </div>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
/*
 * Declare the CSS variables once, in this component, so they can
 * affect both the sizing of CardHolder and of the slotted Cards.
 */
.card-holder,
:slotted(*.card) {
  --cards-overlapping-per-row: 5; /* one less than total */
  --card-height: v-bind(cardHeight);
  --card-padding: v-bind(cardPadding);
  --card-width: calc(var(--card-height) * var(--card-aspect-ratio));
  --card-overlap: max(50px, calc(0.50 * var(--card-width))); /* 50% of card width, no less than 50px */
}

.card-holder {
  --color-label: goldenrod;
  --color-border: var(--color-label);
  --area-border-width: 3px;
  --card-holder-width: calc(350px + var(--card-width) + var(--area-border-width) * 2);

  &.win {
    --color-border: blue; /* TODO: something that stands out, or animate */
  }

  &.disable {
    opacity: 0.25;
    transform: scale(75%);
  }

  /* center label and area along vertical axis */
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;

  width: min-content;

  color: var(--color-label);
  user-select: none;
}

.header {
  align-self: v-bind(headerAlign);

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  column-gap: 0.5em;

  font-size: 16pt;
}

.card-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.card-area {
  --card-area-padding: 15px;

  position: relative; /* anchor for .bust's absolute */

  display: grid;
  /*
   * CSS Grid allows cards to overlap when there are too many for the space given.
   *
   * from https://stackoverflow.com/a/53038326/356016
   *     grid-template-columns: repeat(auto-fit,  minmax(10px, max-content)) ;
   *
   * The area width needs to enclose --cards-overlapping-per-row columns of
   * --card-overlap plus the remaining, full-width card. The row can wrap, if
   * more than --cards-overlapping-per-row + 1 cards are needed, but the
   * average hand in Blackjack is 2.7 cards.
   *     grid-template-columns: repeat(var(--cards-overlapping-per-row), var(--card-overlap)) var(--card-width);
   *
   * This works a little better than the SO solution. It maintains the containing
   * element's padding by accounting for a full-width card at the end. There is a
   * noticeable hiccup as the cards start squeezing leaving room for that last one,
   * until they can no longer squeeze and the last slot is taken. After the first
   * row adjusts, subsequent rows are already aligned as needed.
   */
  grid-template-columns: repeat(auto-fit, minmax(var(--card-overlap), max-content)) var(--card-width);
  align-items: center;
  row-gap: var(--card-area-padding);

  margin: 15px 15px 15px 0;
  padding: var(--card-area-padding);
  cursor: pointer;
  border-radius: var(--card-corner-radius);

  width: calc(
      calc(var(--card-overlap) * var(--cards-overlapping-per-row))/* each of first X cards overlaps */
      + var(--card-width)/* final, whole card */
      + var(--card-area-padding) * 2
      + var(--area-border-width) * 2
  );

  /* start with the height of one card row */
  min-height: calc(var(--card-height) + var(--card-area-padding) * 2 + var(--area-border-width) * 2);

  border: var(--area-border-width) double var(--color-border);

  &.single-column {
    margin: 15px;
    width: calc(
        var(--card-width)
        + var(--card-area-padding) * 2
        + var(--area-border-width) * 2
    );
  }

  /* animate a peek of cards not in a single column */

  &:not(.single-column) :deep(.card) {
    transition: transform 250ms;
  }

  &:not(.single-column) :deep(.card:hover) {
    z-index: 64;
    /* TODO: adjust angle along arc */
    box-shadow: 0 0 25px 15px goldenrod;
  }
}

.bust {
  position: absolute;
  stroke: rgba(255, 0, 0, 0.7);
  stroke-width: 4px;
  height: 100%;
  width: 100%;
}

.area-total {
  display: flex;
  flex-direction: column;

  font-family: "BioRhyme", "Droid Serif", serif;
  font-size: 36pt;
  line-height: 1;
  min-width: 2em;
  text-align: center;
}

.total-label {
  font-size: 16pt;
}
</style>
