<script setup lang="ts">
import {ref, toRaw, watchEffect} from 'vue';
import type {IPlayer} from '@/types/IPlayer';
import type {QInput} from 'quasar';

const props = defineProps<{
    player: IPlayer,
}>();

const emit = defineEmits<{
    (e: 'rename', updatedPlayer: IPlayer): void,
}>();

const errorMessage = ref('');
const inputName = ref<string>('');
watchEffect(() => {
    inputName.value = props.player.name;
});

const validatePlayerName = (updatedName?: string) => {
    if (updatedName) {
        errorMessage.value = '';

        if (updatedName === '') {
            errorMessage.value = 'Name can\'t be empty.';
            return false;
        }
    }

    return true;
};

const setPlayerName = (updatedName: string) => {
    const updatedPlayer = structuredClone(toRaw(props.player));
    updatedPlayer.name = updatedName;
    emit('rename', updatedPlayer);
};
</script>

<template>
  <div class="player-name">
    {{ player.name }}
    <q-icon
      class="edit-icon"
      name="edit"
    />
  </div>

  <q-popup-edit
    v-slot="scope"
    v-model.trim="inputName"
    auto-save
    buttons
    :validate="validatePlayerName"
    @hide="validatePlayerName"
    @save="setPlayerName"
    @show="($refs.input as QInput).select()"
  >
    <q-input
      ref="input"
      v-model.trim="scope.value"
      label="Player name"
      outlined
      autofocus
      :error="errorMessage !== ''"
      :error-message="errorMessage"
      @keyup.enter.stop="scope.set"
      @keyup.esc.stop="scope.cancel"
    />
  </q-popup-edit>
</template>

<style scoped>
.player-name {
  cursor: pointer;

  overflow-x: clip;
  text-overflow: ellipsis;
}

.edit-icon {
  visibility: hidden;
  font-size: 90%;
  opacity: 0.75;
}

.player-name:hover .edit-icon {
  visibility: visible;
}

</style>
