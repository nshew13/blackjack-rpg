<script setup lang="ts">
import {ref} from 'vue';
import InputDialog from '@/components/controls/InputDialog.vue';
import PlayerGroupDropdown from '@/components/controls/PlayerGroupDropdown.vue';
import type {IPlayer, IPlayerGroup} from '@/types/IPlayer';

const props = defineProps<{
  player: IPlayer,
  playerGroups: IPlayerGroup[],
}>();

const emit = defineEmits<{
  (e: 'update', playerGroups: IPlayerGroup[]): void,
}>();

const showDialog = ref<boolean>(false);


const addPlayerToGroup = (group: IPlayerGroup) => {
  group.playerIDs.add(props.player.uuid);
  emit('update', props.playerGroups);
}

const addPlayerToNewGroup = (event: Event, newGroupName: string) => {
  showDialog.value = false;

  // create an IPlayerGroup and add to list
  const newGroup: IPlayerGroup = {
    name: newGroupName,
    playerIDs: new Set(),
  };
  props.playerGroups.push(newGroup);

  addPlayerToGroup(newGroup);
}
</script>

<template>
  <InputDialog
      field-label="Group name"
      :show-dialog="showDialog"
      :starting-value="`Group ${playerGroups.length + 1}`"
      @close="showDialog = false"
      @update="addPlayerToNewGroup"
  ></InputDialog>

  <PlayerGroupDropdown
      help-text="Add player to group"
      icon="group_add"
      :player-groups="playerGroups"
      show-add-group
      @select="addPlayerToGroup"
      @create="showDialog = true"
  ></PlayerGroupDropdown>
</template>
