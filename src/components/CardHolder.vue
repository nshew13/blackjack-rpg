<script setup lang="ts">
const props = withDefaults(defineProps<{
  isActive?: boolean,
  label?: string,
  singleColumn?: boolean,
  total?: number,
}>(), {
  label: '',
  total: 0,
  singleColumn: false,
});
</script>

<template>
  <div class="card-holder" :class="{'active': isActive}">
    <div class="label">{{ label }}</div>
    <div class="card-row">
      <div class="card-area" :class="{'single-column': singleColumn}">
        <slot>
          <!-- expected <Card>(s) or <Deck> -->
        </slot>
      </div>
      <div v-if="total > 0" class="area-total">{{ total }}</div>
    </div>
  </div>
</template>

<style scoped>
.card-holder {
  --color-label: goldenrod;

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
.card-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
.card-area {
  --area-border-width: 3px;

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

  min-height: calc(var(--card-box-height) + var(--area-border-width) * 2);
  width: calc(350px + var(--card-box-width) + var(--area-border-width) * 2);
  margin: var(--card-padding);
  border-radius: var(--card-corner-radius);

  border: var(--area-border-width) double var(--color-label);

  &.single-column {
    width: calc(var(--card-box-width) + var(--area-border-width) * 2);
  }

  /* animate a peek of cards not in a single column */
  &:not(.single-column) :deep(.card) {
    transition: transform 250ms;
  }
  &:not(.single-column) :deep(.card:hover) {
    z-index: 64;
    /* TODO: adjust angle along arc */
    transform: rotate(-5deg) translateY(-30px);
  }
}
.area-total {
  font-family: "BioRhyme", "Droid Serif", serif;
  font-size: 36pt;
}
</style>
