<script setup lang="ts">
import type {IPlayer} from '@/types/IPlayer';

const props = withDefaults(defineProps<{
    player: IPlayer,
    playersCount: number,
}>(), {
    playersCount: 1,
});

const emit = defineEmits<{
    (e: 'remove', player: IPlayer): void,
}>();
</script>

<template>
  <q-btn class="remove-player" icon="close" v-bind="$attrs" @click.stop="emit('remove', player)">
    <q-tooltip>
      Remove player
    </q-tooltip>
  </q-btn>
</template>

<style scoped>
.remove-player {
    color: goldenrod;
}
</style>
