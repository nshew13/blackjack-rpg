<!-- component: InputDialog -->
<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {QInput} from 'quasar';

const props = withDefaults(defineProps<{
    fieldLabel?: string,
    startingValue?: string;
}>(), {
    fieldLabel: 'Input value',
    startingValue: '',
});

const showDialog = defineModel<boolean>({default: false});

const emit = defineEmits<{
    (e: 'close'): void,
    (e: 'update', event: Event, name: string): void,
}>();

const inputField = ref<string>('');
watchEffect(() => {
    inputField.value = props.startingValue;
});


const cancel = () => {
    showDialog.value = false;
    emit('close');
};

const saveChanges = (event: Event) => {
    emit('update', event, inputField.value);
    showDialog.value = false;
    emit('close');
};
</script>

<template>
  <q-dialog
    v-model="showDialog"
    width="500"
    @show="($refs.input as QInput).select()"
  >
    <q-card
      class="input-dialog"
      color="indigo-darken-3"
    >
      <q-input
        ref="input"
        v-model="inputField"
        :label="fieldLabel"
        outlined
        :autofocus="true"
        @keyup.enter.stop="saveChanges"
        @keyup.esc.stop="cancel"
      />

      <q-card-actions align="right">
        <q-btn
          label="Cancel"
          @click.stop="cancel"
        />
        <q-btn
          label="Save"
          color="primary"
          @click.stop="saveChanges"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.input-dialog {
  padding: 30px;
}
</style>
