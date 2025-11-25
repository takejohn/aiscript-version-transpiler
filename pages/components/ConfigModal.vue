<template>
  <div
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white p-6 rounded-lg shadow-xl w-80">
      <h2 class="text-lg font-bold mb-4">設定</h2>

      <label class="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          v-model="localConfig.setVersionNotation"
          class="w-4 h-4"
        />
        <span>バージョン表記を変更する</span>
      </label>

      <div class="flex justify-end gap-2 mt-4">
        <button
          class="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
          @click="close"
        >
          キャンセル
        </button>
        <button
          class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          @click="apply"
        >
          適用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TranspilerConfig } from 'aiscript-version-transpiler';
import { reactive } from 'vue';

const props = defineProps<{
  modelValue: TranspilerConfig;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: TranspilerConfig): void;
  (e: 'close'): void;
}>();

const localConfig = reactive({ ...props.modelValue });

function apply() {
  emits("update:modelValue", { ...localConfig });
  emits("close");
}

function close() {
  emits("close");
}
</script>
