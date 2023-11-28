<script setup lang="ts">
import { useQuasar } from 'quasar';
import BlackjackTable from '@/components/BlackjackTable.vue';

const $q = useQuasar();
$q.dark.set(true);
</script>

<template>
  <BlackjackTable></BlackjackTable>
</template>
