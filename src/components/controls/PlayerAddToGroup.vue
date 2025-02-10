<script setup lang="ts">
import {ref, toRaw} from 'vue';
import InputDialog from '@/components/controls/InputDialog.vue';
import PlayerGroupDropdown from '@/components/controls/PlayerGroupDropdown.vue';
import type {IPlayer, IPlayerGroup} from '@/types/IPlayer';

const props = defineProps<{
    modelValue: IPlayerGroup[],
    player: IPlayer,
}>();

const emit = defineEmits<{
    (e: 'update', playerGroups: IPlayerGroup[]): void,
    (e: 'update:player', player: IPlayer): void,
}>();

const showDialog = ref<boolean>(false);


const addPlayerToGroup = (group: IPlayerGroup) => {
    const updatedPlayer = structuredClone(toRaw(props.player));
    updatedPlayer.inGroup = group.uuid;
    emit('update:player', updatedPlayer);
};

const addPlayerToNewGroup = (event: Event, newGroupName: string) => {
    showDialog.value = false;

    // create an IPlayerGroup and add to list
    const newGroup: IPlayerGroup = {
        name: newGroupName,
        uuid: crypto.randomUUID(),
    };

    const updatedGroup = structuredClone(toRaw(props.modelValue));
    updatedGroup.push(newGroup);
    emit('update', updatedGroup);

    addPlayerToGroup(newGroup);
};
</script>

<template>
  <InputDialog
    field-label="Group name"
    :show-dialog="showDialog"
    :starting-value="`Group ${modelValue.length + 1}`"
    @close="showDialog = false"
    @update="addPlayerToNewGroup"
  />

  <PlayerGroupDropdown
    help-text="Add player to group"
    icon="group_add"
    :player-groups="modelValue"
    show-add-group
    @select="addPlayerToGroup"
    @create="showDialog = true"
  />
</template>
