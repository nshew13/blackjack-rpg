<script setup lang="ts">
import {ref, watchEffect} from 'vue';

const props = withDefaults(defineProps<{
  message?: string,
  showDialog?: boolean,
}>(), {
  message: 'Are you sure?',
  showDialog: false,
});

const emit = defineEmits<{
  (e: 'cancel'): void,
  (e: 'close'): void,
  (e: 'ok'): void,
}>()

const showDialog = ref<boolean>(false);
watchEffect(() => showDialog.value = props.showDialog);

const cancel = () => {
  emit('cancel');
  showDialog.value = false;
  emit('close');
};

const ok = () => {
  emit('ok');
  showDialog.value = false;
  emit('close');
}
</script>

<template>
  <v-dialog v-model="showDialog" width="500">
      <v-card class="confirmation-dialog" color="indigo-darken-3">
        {{ message }}

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="No" @click.stop="cancel"></v-btn>
          <v-btn text="Yes" color="primary" @click.stop="ok"></v-btn>
        </v-card-actions>
      </v-card>
  </v-dialog>
</template>

<style scoped>
.confirmation-dialog {
  padding: 30px;
}
</style>
