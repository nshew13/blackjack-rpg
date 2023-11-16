<script setup lang="ts">
const props = withDefaults(defineProps<{
  isActive?: boolean,
  label?: string,
  singleColumn?: boolean,
}>(), {
  label: '',
  singleColumn: false,
});
</script>

<template>
  <div class="card-holder" :class="{'active': props.isActive}">
    <div class="label">{{ props.label }}</div>
    <div class="card-area" :class="{'single-column': props.singleColumn}">
      <slot>
        <!-- expected <Card>(s) or <Deck> -->
      </slot>
    </div>
  </div>
</template>

<style scoped>
.card-holder {
  --color-label: goldenrod;

  /* center label and area along vertical axis */
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;

  &.active {
    .card-area {
      border-color: white;
    }
    .label {
      color: white;
    }

  }
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
}
.label {
  color: var(--color-label);
}
</style>
