/* tslint:disable */
/* eslint-disable */

export function get_page_count(content: string, template: string, config_json: string): number;

export function init(): void;

export function load_font(name: string, data: Uint8Array): void;

export function render_card(content: string, template: string, config_json: string): Uint8Array;

export function render_card_svg(content: string, template: string, config_json: string): string;

export function render_page(content: string, template: string, config_json: string, page_idx: number): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly get_page_count: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly init: () => void;
    readonly load_font: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly render_card: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly render_card_svg: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly render_page: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
    readonly __wbindgen_export: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export2: (a: number, b: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
