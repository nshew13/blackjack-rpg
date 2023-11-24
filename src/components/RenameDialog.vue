<script setup lang="ts">
import {ref} from 'vue';

const inputName = ref<string>('');
const showDialog = ref<boolean>(false);

const hide = () => { showDialog.value = false };
const show = () => { showDialog.value = true };

const emit = defineEmits<{
  (e: 'update', event: Event, name: string): void
}>()

const saveChanges = (event: Event) => {
  emit('update', event, inputName.value);
  hide();
}
</script>

<template>
  <v-btn class="rename-btn" text="Rename" @click.stop="show"></v-btn>

  <v-dialog v-model="showDialog" width="500">
    <template v-slot:default>
      <v-card class="rename-dialog" color="indigo-darken-3">
        <v-text-field
            v-model="inputName"
            label="Player name"
            variant="outlined"
        ></v-text-field>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="Cancel" @click.stop="hide"></v-btn>
          <v-btn text="Save" color="primary" @click.stop="saveChanges"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped>
.rename-dialog {
  padding: 30px;
}
</style>
