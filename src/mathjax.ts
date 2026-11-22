declare global {
	interface Window {
		MathJax: Partial<MathJaxConfig> | MathJaxNormal;
	}
}

export type MathJaxNormal = {
	version: string;
	tex2chtml: (preamble: string) => void;
	startup: {
		ready: () => void;
		defaultReady: () => void;
	};
};

export type MathJaxConfig = {
	// to make the two incompatible, but doesn't actually have a version
	version?: number;
	loader: Partial<{
		/** example: '[tex]/tagformat' */
		load: string[];
	}>;
	options: Partial<MathJaxOptions>;
	tex: Partial<MathJaxTex>;
	startup: Partial<{
		pageReady: () => unknown;
	}>;
	tagformat: Partial<{
		tag: (n: number) => string;
	}>;
};

type MathJaxTex = {
	packages:
		| {
			  "[+]": string[];
			  "[-]": string[];
		  }
		| string[];
	tagSide: "left" | "right";
	macros: Record<string, string | [string, number]>;
	inlineMath: [string, string][];
	displayMath: [string, string][];
	processEsacpes: boolean;
	processEnvironments: boolean;
	processRefs: boolean;
	numberPattern: RegExp;
	initialDigit: RegExp;
	identifierPattern: RegExp;
	initalLetter: RegExp;
	tags: "ams" | "all" | "none";
	/** css unit */
	tagIndent: string;
	tagAlign: string;
	useLabelIds: boolean;
	ignoreDuplicateLabels: boolean;
	mathStyle: "TeX" | "ISO" | "French" | "upright";
	maxBuffer: number;
	maxTemplateSubtiutions: number;
	baseURL: string;
	formatError: (message: string, data: { [key: string]: unknown }) => void;
	preFilters: ((data: { math: string; display: boolean }) => {
		math: string;
		display: boolean;
	})[];
	postFilters: ((data: { math: string; display: boolean }) => {
		math: string;
		display: boolean;
	})[];
};

type MathJaxOptions = {
	safeOptions: Partial<MathJaxSafeOptions>;
};

type SafeOptionString = "safe" | "all" | "none";
type MathJaxSafeOptions = {
	safeProtocols: Partial<MathJaxSafeProtocols>;
	allow: Partial<{
		URLs: SafeOptionString;
		classes: SafeOptionString;
		styles: SafeOptionString;
		cssIDs: SafeOptionString;
	}>;
};

type MathJaxSafeProtocols = {
	http: boolean;
	data: boolean;
	file: boolean;
	https: boolean;
	javascript: boolean;
};

export function setMathJaxGlobal(mathjax: Partial<MathJaxConfig>) {
	if (Object.prototype.hasOwnProperty.call(window, "MathJax")) {
		console.error(
			"window.MathJax is already defined. Custom config for extended mathjax is not loaded. Make sure this plugin loads first.",
		);
		return;
	}
	Object.defineProperty(window, "MathJax", {
		get: () => mathjax,
		set: (value: Partial<MathJaxConfig> | MathJaxNormal) => {
			if (
				Object.prototype.hasOwnProperty.call(value, "version") &&
				typeof value.version === "string"
			) {
				Object.defineProperty(window, "MathJax", {
					value: value,
					writable: true,
					configurable: true,
					enumerable: true,
				});
				return value;
			}
			mathjax = mergeObjects(mathjax, value as Record<string, unknown>, true);
			return mathjax;
		},
		configurable: true,
		enumerable: true,
	});
}

function mergeObjects(
	source1: Record<string, unknown>,
	source2: Record<string, unknown>,
	overrideArrays: boolean,
): Record<string, unknown> {
	const merged: Record<string, unknown> = {};
	for (const key of Object.keys(source1)) {
		const value = source1[key];
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			merged[key] = mergeObjects(
				(source2[key] as Record<string, unknown>) ?? {},
				value as Record<string, unknown>,
				overrideArrays,
			);
		} else if (Array.isArray(value)) {
			const value1 = (source2[key] ?? []) as unknown[];
			if (overrideArrays) {
				merged[key] = value;
			} else {
				merged[key] = [...value1, ...(value as unknown[])];
			}
		} else {
			merged[key] = value;
		}
	}

	function setObject(obj: Record<string, unknown>, key: string, value: unknown) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) {
			obj[key] = value;
			return;
		} else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			for (const subKey of Object.keys(value)) {
				setObject(
					value as Record<string, unknown>,
					subKey,
					(value as Record<string, unknown>)[subKey],
				);
			}
		}
	}

	for (const key of Object.keys(source2)) {
		setObject(merged, key, source2[key]);
	}
	return merged;
}
