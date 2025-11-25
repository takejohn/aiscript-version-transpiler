export type TranspilerConfig = {
	readonly setVersionNotation: boolean;
};

export const defaultConfig: TranspilerConfig = {
	setVersionNotation: false,
} as const;
