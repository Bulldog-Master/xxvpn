/**
 * WASM Loader for xxdk
 * 
 * Loads the xxdk WebAssembly module if available, otherwise falls back to mock
 */

export interface WASMModule {
  NewCmix: (ndf: string, storageDir: string, password: string, registrationCode: string) => any;
  LoadCmix: (storageDir: string, password: string, params: any) => any;
  GetVersion: () => string;
  GetDefaultCMixParams: () => any;
  // Add other WASM exports as needed
}

let wasmModule: WASMModule | null = null;
let wasmLoading: Promise<WASMModule | null> | null = null;

/**
 * Check if WASM files are available
 */
async function checkWASMAvailability(): Promise<boolean> {
  try {
    const wasmResponse = await fetch('/xxdk-wasm/xxdk.wasm', { method: 'HEAD' });
    const jsResponse = await fetch('/xxdk-wasm/wasm_exec.js', { method: 'HEAD' });
    return wasmResponse.ok && jsResponse.ok;
  } catch {
    return false;
  }
}

/**
 * Load the Go WASM runtime
 */
async function loadGoWASM(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/xxdk-wasm/wasm_exec.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load wasm_exec.js'));
    document.head.appendChild(script);
  });
}

/**
 * Load the xxdk WASM module
 */
export async function loadWASM(): Promise<WASMModule | null> {
  // Return cached module if already loaded
  if (wasmModule) {
    return wasmModule;
  }

  // Return existing loading promise if currently loading
  if (wasmLoading) {
    return wasmLoading;
  }

  // Start loading
  wasmLoading = (async () => {
    try {
      console.log('[xxDK WASM] Checking WASM availability...');
      
      const isAvailable = await checkWASMAvailability();
      
      if (!isAvailable) {
        console.warn('[xxDK WASM] WASM files not found. Using mock implementation.');
        console.warn('[xxDK WASM] To use real WASM, see docs/WASM_BUILD_INSTRUCTIONS.md');
        return null;
      }

      console.log('[xxDK WASM] Loading Go WASM runtime...');
      await loadGoWASM();

      console.log('[xxDK WASM] Fetching xxdk.wasm module...');
      const response = await fetch('/xxdk-wasm/xxdk.wasm');
      const wasmBytes = await response.arrayBuffer();

      console.log('[xxDK WASM] Instantiating WebAssembly module...');
      
      // @ts-ignore - Go WASM adds this global
      const go = new window.Go();
      const result = await WebAssembly.instantiate(wasmBytes, go.importObject);
      
      // Run the Go program
      go.run(result.instance);

      // The WASM module exports functions to the global scope
      // @ts-ignore - xxdk functions are added by WASM
      wasmModule = {
        // @ts-ignore
        NewCmix: window.NewCmix,
        // @ts-ignore
        LoadCmix: window.LoadCmix,
        // @ts-ignore
        GetVersion: window.GetVersion,
        // @ts-ignore
        GetDefaultCMixParams: window.GetDefaultCMixParams,
      };

      console.log('[xxDK WASM] Module loaded successfully');
      console.log('[xxDK WASM] Version:', wasmModule.GetVersion?.());

      return wasmModule;
    } catch (error) {
      console.error('[xxDK WASM] Failed to load WASM module:', error);
      console.warn('[xxDK WASM] Falling back to mock implementation');
      return null;
    } finally {
      wasmLoading = null;
    }
  })();

  return wasmLoading;
}

/**
 * Get the loaded WASM module (sync)
 */
export function getWASM(): WASMModule | null {
  return wasmModule;
}

/**
 * Check if WASM is loaded
 */
export function isWASMLoaded(): boolean {
  return wasmModule !== null;
}
