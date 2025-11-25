import type { TranspilerConfig } from 'aiscript-version-transpiler';

const STORAGE_CONFIG_KEY = 'aiscript-version-transpiler:config';

export function loadConfig(): TranspilerConfig {
	const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
	if (saved) {
		return JSON.parse(saved);
	}
	return {
		setVersionNotation: false,
	};
}

export function saveConfig(value: TranspilerConfig): void {
	localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(value));
}
