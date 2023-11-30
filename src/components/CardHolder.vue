<script setup lang="ts">
import {computed} from 'vue';
import type {TCardSize} from '@/utilities/PlayingCards';

const props = withDefaults(defineProps<{
  bust?: boolean,
  cardSize?: TCardSize,
  label?: string,
  singleColumn?: boolean,
  total?: number,
  win?: boolean,
}>(), {
  bust: false,
  cardSize: 'large',
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
})

const cardPadding = computed(() => {
  switch (props.cardSize) {
    case 'large':
    default:
      return '10px';

    case 'small':
      return '0';
  }
})

const showTotal = typeof props?.total !== 'undefined';
</script>

<template>
  <div class="card-holder-container">
    <div class="card-holder" :class="{ 'win': win }">
      <div class="header">
        <slot name="header">{{ label }}</slot>
      </div>

      <div class="card-row">
        <div class="card-area" :class="{'single-column': singleColumn}" @click.stop="emit('deal')">
          <slot :card-size="cardSize">
            <!-- expected <Card>(s) or <Deck> -->
          </slot>
          <svg v-if="bust" class="bust" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
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
  --card-height: v-bind(cardHeight);
  --card-padding: v-bind(cardPadding);
  --card-width: calc(var(--card-height) * var(--card-aspect-ratio));
}

.card-holder-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-bottom: 1em;
}
.card-holder {
  --color-label: goldenrod;
  --color-border: var(--color-label);
  --area-border-width: 3px;
  --card-holder-width: calc(350px + var(--card-width) + var(--area-border-width) * 2);

  &.win {
    --color-border: blue;
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

  /*
   * CSS Grid allows us to allow cards to overlap when there are
   * too many for the space given.
   *
   * TODO: auto-fit allows full face until things get cramped, but then it allows the final card to overflow
   *       grid-template-columns: repeat(auto-fit,  minmax(10px, max-content)) ;
   *       from https://stackoverflow.com/a/53038326/356016
   *
   * The area width needs to enclose 7 columns of 50px plus the
   * remaining, full-width card. It can wrap, if more than 8 cards
   * are needed, but the average in Blackjack is 2.7.
   *
   */
  display: grid;
  grid-template-columns: repeat(8, 50px);
  align-items: center;
  row-gap: var(--card-area-padding);

  margin: 15px;
  padding: var(--card-area-padding);
  cursor: pointer;
  border-radius: var(--card-corner-radius);

  width: calc(
    calc(0.50 * var(--card-width) * 7) /* 50% each of first 7 overlapping cards */
    + var(--card-width) /* final, whole card */
    + var(--card-area-padding) * 2
    + var(--area-border-width) * 2
  );

  /* start with the height of one card row */
  min-height: calc(var(--card-height) + var(--card-area-padding) * 2 + var(--area-border-width) * 2);

  /* TODO?: move border to card-row to include total */
  border: var(--area-border-width) double var(--color-border);

  &.single-column {
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
