<script setup lang="ts">
import type {IPlayerGroup} from '@/types/IPlayer';
import type {QBtnDropdown} from 'quasar';

const props = withDefaults(defineProps<{
  helpText?: string,
  icon?: string,
  label?: string,
  playerGroups: IPlayerGroup[],
  showAddGroup?: boolean,
}>(), {
  helpText: '',
  icon: 'groups',
  label: '',
  showAddGroup: false,
});

const emit = defineEmits<{
  (e: 'create'): void,
  (e: 'select', playerGroup: IPlayerGroup): void,
}>();

const selectGroup = (playerGroup: IPlayerGroup) => {
  emit('select', playerGroup);
}

const createGroup = () => {
  emit('create');
}
</script>

<template>
  <q-btn-dropdown
      v-if="playerGroups.length > 0 || showAddGroup"
      ref="playerGroupDropdown"
      color="primary"
      auto-close
      :icon="icon"
      :label="label"
  >
    <q-tooltip v-if="helpText">{{ helpText }}</q-tooltip>
    <q-list
        class="player-group-list"
        bordered
    >
      <q-item-label v-if="helpText" class="label">{{ helpText }}</q-item-label>
      <q-item
          v-for="group in playerGroups"
          :key="group.name"
          clickable
          @click="() => selectGroup(group)"
      >{{ group.name }}</q-item>
      <q-item v-if="showAddGroup" clickable @click="createGroup">
        New group
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<style scoped>
.label {
  font-style: italic;
  margin-bottom: 1em;
}
.player-group-list {
  padding: 10px;
}
.player-group-list :deep(.row) {
  align-items: center;
}
</style>
