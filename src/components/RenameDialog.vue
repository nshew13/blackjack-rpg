<script setup lang="ts">
import {ref, watchEffect} from 'vue';

const props = withDefaults(defineProps<{
  showDialog?: boolean,
  startingValue?: string;
}>(), {
  showDialog: false,
  startingValue: '',
});

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'update', event: Event, name: string): void,
}>()

const inputName = ref<string>('');
const showDialog = ref<boolean>(false);
watchEffect(() => {
  inputName.value = props.startingValue;
  showDialog.value = props.showDialog;
});


const cancel = () => {
  showDialog.value = false
  emit('close');
};

const saveChanges = (event: Event) => {
  emit('update', event, inputName.value);
  showDialog.value = false
  emit('close');
}
</script>

<template>
  <q-dialog v-model="showDialog" width="500">
    <q-card class="rename-dialog" color="indigo-darken-3">
      <q-input
          v-model="inputName"
          label="Player name"
          outlined
          :autofocus="true"
          @keyup.enter.stop="saveChanges"
          @keyup.esc.stop="cancel"
      ></q-input>

      <q-card-actions>
        <q-btn label="Cancel" @click.stop="cancel"></q-btn>
        <q-btn label="Save" color="primary" @click.stop="saveChanges"></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.rename-dialog {
  padding: 30px;
}
</style>
