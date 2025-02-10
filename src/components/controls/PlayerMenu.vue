<script setup lang="ts">
import type {IPlayer} from '@/types/IPlayer';

withDefaults(defineProps<{
    player: IPlayer,
    playersCount: number,
}>(), {
    playersCount: 1,
});

const emit = defineEmits<{
    (e: 'remove', player: IPlayer): void,
    (e: 'rename', player: IPlayer): void,
}>();
</script>

<template>
  <q-btn
    icon="more_vert"
    size="small"
    padding="0"
    flat
  >
    <q-menu auto-close>
      <q-list>
        <q-item
          :disable="playersCount <= 1"
          clickable
          @click="emit('remove', player)"
        >
          Remove
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
