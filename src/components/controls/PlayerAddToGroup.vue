<script setup lang="ts">
import {ref} from 'vue';
import type {IPlayer, IPlayerGroup} from '@/types/IPlayer';

const props = defineProps<{
  player: IPlayer,
}>();

const emit = defineEmits<{
  (e: 'remove', player: IPlayer): void,
}>();


const showMenu = ref<boolean>(false);

const groups = ref<IPlayerGroup[]>([
  {name: 'Group 1', playerIDs: []},
  {name: 'Group for more', playerIDs: []},
]);

const handleClick = () => {
  console.log('click');
}
</script>

<template>
  <q-icon name="group_add" @mouseover="showMenu = true" @mouseleave="showMenu = false">
    <q-menu v-model="showMenu" auto-close @mouseleave="showMenu = false">
      <q-list class="add-to-group" bordered>
        <q-item-label class="label">Add player to group:</q-item-label>
        <q-item
            v-for="group in groups"
            :key="group.name"
            clickable
            @click="handleClick"
        >{{ group.name }}</q-item>
      </q-list>
    </q-menu>
  </q-icon>


  <q-btn-dropdown color="primary" icon="group_add" auto-close>
    <q-tooltip>Add player to group</q-tooltip>
    <q-list class="add-to-group" bordered>
      <q-item-label class="label">Add player to group:</q-item-label>
      <q-item
          v-for="group in groups"
          :key="group.name"
          clickable
          @click="handleClick"
      >{{ group.name }}</q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<style scoped>
.label {
  font-style: italic;
  margin-bottom: 1em;
}
.add-to-group {
  padding: 10px;
}
.add-to-group :deep(.row) {
  align-items: center;
}
</style>
