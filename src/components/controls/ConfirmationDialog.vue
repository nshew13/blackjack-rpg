<!-- component: ConfirmationDialog -->
<script setup lang="ts">
interface IProps {
    message?: string,
}

withDefaults(defineProps<IProps>(), {
    message: 'Are you sure?',
});

const emit = defineEmits<{
    (e: 'cancel'): void,
    (e: 'close'): void,
    (e: 'ok'): void,
}>();

const showDialog = defineModel<boolean>({default: false});

const cancel = () => {
    emit('cancel');
    showDialog.value = false;
    emit('close');
};

const ok = () => {
    emit('ok');
    showDialog.value = false;
    emit('close');
};
</script>

<template>
  <q-dialog
    v-model="showDialog"
    width="500"
  >
    <q-card
      class="confirmation-dialog"
      color="indigo-darken-3"
    >
      {{ message }}

      <q-card-actions align="right">
        <q-btn
          label="No"
          @click.stop="cancel"
        />
        <q-btn
          label="Yes"
          color="primary"
          @click.stop="ok"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.confirmation-dialog {
  padding: 30px;
}
</style>
