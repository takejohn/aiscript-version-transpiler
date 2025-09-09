<template>
	<div class="min-h-screen p-6 bg-gray-50 relative">
		<h1 class="text-2xl font-bold mb-4">aiscript-version-transpiler</h1>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- 入力エリア -->
			<div class="flex flex-col">
				<label class="mb-2 font-semibold text-gray-700">Input Script (v0.19.0)</label>
				<textarea
					v-model="input"
					ref="inputArea"
					@keydown="handleTab"
					class="flex-1 p-3 border rounded-lg font-mono text-sm"
				></textarea>
			</div>

			<!-- 出力エリア -->
			<div class="flex flex-col">
				<label class="mb-2 font-semibold text-gray-700">Transpiled Output (v1.1.0)</label>

				<!-- relativeで内側にposition基準を設定 -->
				<div class="relative flex-1">
					<pre
						class="flex-1 p-3 border rounded-lg font-mono text-sm overflow-auto transition-colors"
						:class="isError ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-gray-300 text-gray-800'"
					>
{{ output }}
					</pre>
					<!-- 内側右上に配置 -->
					<button
						class="absolute top-2 right-2 p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
						@click="copyOutput"
						title="Copy output"
						v-if="!isError"
					>
						<CopyIcon class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>

		<!-- トースト通知 -->
		<transition name="fade">
			<div
				v-if="showToast"
				class="fixed top-4 right-4 bg-green-600 text-white text-sm px-4 py-2 rounded shadow-lg"
			>
				{{ toastMessage }}
			</div>
		</transition>

		<!-- フッター -->
    <footer class="mt-8 pt-4 border-t text-sm text-gray-600 text-center">
      <FooterLink href="https://github.com/takejohn/aiscript-version-transpiler">
        Source
			</FooterLink>
      •
      <FooterLink href="https://github.com/takejohn/aiscript-version-transpiler/issues">
        Bugs
			</FooterLink>
      •
      <FooterLink href="https://mk.takejohn.jp/@takejohn">
        Misskey
			</FooterLink>
    </footer>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { transpile } from 'aiscript-version-transpiler';
import { Copy as CopyIcon } from 'lucide-vue-next';

import FooterLink from '../components/FooterLink.vue';

const STORAGE_KEY = 'aiscript-version-transpiler:input-script';
const defaultInput = `/* Write your AiScript code here... */`;
const input = ref<string>(defaultInput);
const output = ref<string>('');
const isError = ref<boolean>(false);
const inputArea = ref<HTMLTextAreaElement | null>(null);

const showToast = ref(false);
const toastMessage = ref('');
let toastTimer: number | null = null;

// 入力変更時にリアルタイムで変換
watch(input, (newVal) => {
	localStorage.setItem(STORAGE_KEY, newVal);
	try {
		output.value = transpile(newVal);
		isError.value = false;
	} catch (err: any) {
		output.value = `Error: ${err.message ?? err}`;
		isError.value = true;
	}
});

onMounted(() => {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved != null) {
		input.value = saved;
	}
});

// Tabキー入力を処理
function handleTab(e: KeyboardEvent) {
	if (e.key === "Tab") {
		e.preventDefault();
		const textarea = inputArea.value;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		input.value =
			input.value.substring(0, start) + "\t" + input.value.substring(end);

		requestAnimationFrame(() => {
			textarea.selectionStart = textarea.selectionEnd = start + 1;
		});
	}

	// Enterキー入力を処理
	if (e.key === "Enter") {
		e.preventDefault();
		const textarea = inputArea.value;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		// 現在のカーソル位置より前のテキストを取得
		const before = input.value.substring(0, start);

		// 直前の行を取得
		const lastLineBreak = Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r"));
		const currentLine = before.substring(lastLineBreak + 1);

		// 行頭の空白（スペースまたはタブ）のみを抽出
		const indentMatch = currentLine.match(/^[ \t]*/);
		const indent = indentMatch ? indentMatch[0] : "";

		// 改行とインデントを挿入
		const insertText = "\n" + indent;
		input.value =
			input.value.substring(0, start) +
			insertText +
			input.value.substring(end);

		requestAnimationFrame(() => {
			const newPos = start + insertText.length;
			textarea.selectionStart = textarea.selectionEnd = newPos;
		});
	}
}

// 出力をコピー
const copyOutput = async () => {
	try {
		await navigator.clipboard.writeText(output.value);
		triggerToast('Copied to clipboard!');
	} catch {
		triggerToast('Failed to copy output.');
	}
};

// トースト表示
function triggerToast(message: string) {
	toastMessage.value = message;
	showToast.value = true;
	if (toastTimer) {
		clearTimeout(toastTimer);
	}
	toastTimer = window.setTimeout(() => {
		showToast.value = false;
	}, 2000);
}
</script>

<style scoped>
textarea {
	resize: none;
	min-height: 300px;
}

pre {
	min-height: 300px;
}

/* フェードイン・アウトアニメーション */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
