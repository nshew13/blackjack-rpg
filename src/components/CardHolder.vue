<script setup lang="ts">
const props = withDefaults(defineProps<{
  isActive?: boolean,
  label?: string,
  singleColumn?: boolean,
  total?: number,
}>(), {
  label: '',
  singleColumn: false,
});

const showTotal = typeof props?.total !== 'undefined';
</script>

<template>
  <div class="card-holder" :class="{'active': isActive}">
    <div class="header">
      <slot name="header">{{ label }}</slot>
    </div>
    <div class="card-row">
      <div class="card-area" :class="{'single-column': singleColumn}">
        <slot>
          <!-- TODO: add variation in offset and rotation -->
          <!-- expected <Card>(s) or <Deck> -->
        </slot>
      </div>
      <div v-if="showTotal" class="area-total">
        <span class="total-label">Total</span>
        <span>{{ total < 0 ? '--' : total }}</span>
        <slot name="actions"></slot>
      </div>
    </div>
    <slot v-if="$slots.actions" name="actions"></slot>
  </div>
</template>

<style scoped>
.card-holder {
  --color-label: goldenrod;
  --area-border-width: 3px;
  --card-holder-width: calc(350px + var(--card-width) + var(--area-border-width) * 2);

  &.active {
    --color-label: white;
  }

  /* center label and area along vertical axis */
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;

  color: var(--color-label);
}
.header {
  flex: 1 0 0;

  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;

  font-size: 16pt;
}
.card-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
.card-area {
  --card-area-padding: 15px;

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

  width: calc(
      350px /* 350px = 50px * 7 overlapping cards */
      + var(--card-width) /* final, whole card */
      + var(--card-area-padding) * 2
      + var(--area-border-width) * 2
  );
  min-height: calc(var(--card-height) + var(--card-area-padding) * 2 + var(--area-border-width) * 2);
  border-radius: var(--card-corner-radius);

  /* TODO?: move border to card-row to include total */
  border: var(--area-border-width) double var(--color-label);

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
