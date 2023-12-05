<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import type {IPlayer} from '@/types/IPlayer';

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update', enabled: IPlayer['enabled']): void,
}>();

const internalValue = ref<boolean>(true);
watchEffect(() => {
  internalValue.value = props.modelValue ?? true;
});
</script>

<template>
  <q-toggle
      v-model="internalValue"
      v-bind="$attrs"
      checked-icon="check"
      color="positive"
      unchecked-icon="clear"
      @update="emit('update', internalValue)"
  >
    <q-tooltip>
      {{ internalValue ? 'Disable' : 'Enable' }} player
    </q-tooltip>
  </q-toggle>
</template>
