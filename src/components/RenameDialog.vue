<script setup lang="ts">
import {ref} from 'vue';

const inputName = ref<string>('');
const showDialog = ref<boolean>(false);
let nameBackup = '';

const emit = defineEmits<{
  (e: 'update', event: Event, name: string): void
}>()


const cancel = () => {
  showDialog.value = false
  inputName.value = nameBackup;
};

const show = () => {
  nameBackup = inputName.value;
  showDialog.value = true
};

const saveChanges = (event: Event) => {
  emit('update', event, inputName.value);
  showDialog.value = false
}
</script>

<template>
  <v-btn class="rename-btn" text="Rename" @click.stop="show"></v-btn>

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
