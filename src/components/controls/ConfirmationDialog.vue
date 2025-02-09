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
}>();

const showDialogInternal = ref<boolean>(false);
watchEffect(() => showDialogInternal.value = props.showDialog);

const cancel = () => {
    emit('cancel');
    showDialogInternal.value = false;
    emit('close');
};

const ok = () => {
    emit('ok');
    showDialogInternal.value = false;
    emit('close');
};
</script>

<template>
  <q-dialog v-model="showDialogInternal" width="500">
    <q-card class="confirmation-dialog" color="indigo-darken-3">
      {{ message }}

      <q-card-actions>
        <q-btn label="No" @click.stop="cancel"></q-btn>
        <q-btn label="Yes" color="primary" @click.stop="ok"></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.confirmation-dialog {
  padding: 30px;
}
</style>
