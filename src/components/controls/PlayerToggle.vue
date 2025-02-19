<!-- component: PlayerToggle -->
<script setup lang="ts">
import type {IPlayer} from '@/types/IPlayer';

const emit = defineEmits<{
    (e: 'update', enabled: IPlayer['enabled']): void,
}>();

const playerEnabled = defineModel<boolean>({default: true});
</script>

<template>
  <q-toggle
    v-model="playerEnabled"
    v-bind="$attrs"
    checked-icon="check"
    color="positive"
    unchecked-icon="clear"
    @update="emit('update', playerEnabled)"
  >
    <q-tooltip>
      {{ playerEnabled ? 'Disable' : 'Enable' }} player
    </q-tooltip>
  </q-toggle>
</template>
