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
  <v-dialog v-model="showDialog" width="500">
    <v-card class="rename-dialog" color="indigo-darken-3">
      <v-text-field
          v-model="inputName"
          label="Player name"
          variant="outlined"
          :autofocus="true"
          @keyup.enter.stop="saveChanges"
          @keyup.esc.stop="cancel"
      ></v-text-field>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text="Cancel" @click.stop="cancel"></v-btn>
        <v-btn text="Save" color="primary" @click.stop="saveChanges"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.rename-dialog {
  padding: 30px;
}
</style>
