<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import type {IPlayer} from '@/types/IPlayer';

const props = defineProps<{
  isEnabled: boolean,
}>();

const emit = defineEmits<{
  (e: 'toggle', player: IPlayer): void,
}>();

const internalValue = ref<boolean>();
watchEffect(() => {
  internalValue.value = props.isEnabled ?? true;
});

</script>

<template>
  <q-toggle
      v-model="internalValue"
      v-bind="$attrs"
      checked-icon="check"
      color="positive"
      unchecked-icon="clear"
      @update="emit('toggle', internalValue)"
  >
    <q-tooltip>
      {{ internalValue ? 'Disable' : 'Enable' }} player
    </q-tooltip>
  </q-toggle>
</template>
