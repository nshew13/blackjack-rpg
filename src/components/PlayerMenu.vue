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

  <v-menu transition="scale-transition">
    <template v-slot:activator="{ props }">
      <v-btn icon="mdi-dots-vertical" v-bind="props" size="small"></v-btn>
    </template>

    <v-list>
      <v-list-item title="Rename" @click="showRename = true"></v-list-item>
      <v-list-item title="Remove" @click="emit('remove', player)" :disabled="playersCount <= 1"></v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.confirmation-dialog {
  padding: 30px;
}
</style>
