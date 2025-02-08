<script setup lang="ts">
import { useQuasar } from 'quasar';
import BlackjackTable from '@/components/BlackjackTable.vue';

const $q = useQuasar();
$q.dark.set(true);
</script>

<template>
  <BlackjackTable />
</template>

<style scoped>
body {
  padding: 2rem;
  font-weight: normal;

  min-height: 100vh;
  color: var(--color-text);
  background: var(--color-background);
  font-family:
      Roboto,
      'Droid Sans',
      'Helvetica Neue',
      sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
