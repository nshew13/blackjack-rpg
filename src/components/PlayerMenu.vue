<script setup lang="ts">
import {ref} from 'vue';
import RenameDialog from '@/components/RenameDialog.vue';
import type {IPlayer} from '@/components/BlackjackTable.vue';

const props = withDefaults(defineProps<{
  player: IPlayer,
  playersCount: number,
}>(), {
  playersCount: 1,
});

const emit = defineEmits<{
  (e: 'remove', player: IPlayer): void,
  (e: 'rename', player: IPlayer): void,
}>();

const showRename = ref<boolean>(false);

const rename = (player: IPlayer, newName: string) => {
  if (newName) {
    const updatedPlayer = player;
    updatedPlayer.name = newName;
    emit('rename', updatedPlayer);
  }
};
</script>

<template>
  <RenameDialog
      :show-dialog="showRename"
      :starting-value="player.name"
      @update="(evt, name) => rename(player, name)"
      @close="showRename = false"
  ></RenameDialog>

  <q-btn icon="more_vert" size="small" padding="0" flat>
    <q-menu auto-close>
      <q-list>
        <q-item clickable @click="showRename = true">Rename</q-item>
        <q-item :disable="playersCount <= 1" clickable @click="emit('remove', player)">Remove</q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
