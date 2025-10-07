# Building xxdk WASM Module

## Prerequisites

1. **Go 1.19+**
   ```bash
   go version
   ```

2. **TinyGo 0.26.0+**
   ```bash
   tinygo version
   ```

3. **Make**
   ```bash
   make --version
   ```

## Build Steps

### 1. Clone the xxdk-wasm Repository

```bash
cd /tmp  # or any working directory
git clone https://git.xx.network/elixxir/xxdk-wasm.git
cd xxdk-wasm
```

### 2. Build the WASM Module

```bash
make wasm
```

This will generate:
- `xxdk.wasm` - The WebAssembly binary
- `wasm_exec.js` - The Go WASM runtime

### 3. Copy Files to Your Project

```bash
# From the xxdk-wasm directory, copy to your project's public folder
cp xxdk.wasm /path/to/your/project/public/
cp wasm_exec.js /path/to/your/project/public/
```

Or manually:
1. Copy `xxdk.wasm` to `public/xxdk.wasm`
2. Copy `wasm_exec.js` to `public/wasm_exec.js`

### 4. Verify Files

Make sure these files exist in your `public/` folder:
- `public/xxdk.wasm` (~10-20 MB)
- `public/wasm_exec.js` (~18 KB)

## Development vs Production

### Development Mode
The app will automatically detect if WASM files are missing and fall back to the mock implementation. You'll see console warnings but the app will still work for testing the UI.

### Production Mode
Once you've built and copied the WASM files:
1. The app will automatically load the real WASM module
2. You'll see `[xxDK WASM] Module loaded successfully` in the console
3. All cryptographic operations will use the real cMixx protocol

## Troubleshooting

### Build Fails
- Ensure Go and TinyGo versions meet requirements
- Check you have sufficient disk space (~1GB for build)
- Try `make clean` then `make wasm` again

### WASM Load Fails
- Check browser console for specific errors
- Verify file sizes (xxdk.wasm should be 10-20MB)
- Ensure files are in `public/` folder, not `src/`
- Clear browser cache and hard reload

### Module Not Found
- The WASM files must be in the `public/` folder
- Don't import them as modules
- They're loaded at runtime via fetch

## References

- [xxdk-wasm Repository](https://git.xx.network/elixxir/xxdk-wasm)
- [ReactJS Example](https://git.xx.network/xx_network/xxdk-examples/-/tree/master/reactjs)
- [xx Network Documentation](https://xxnetwork.wiki/)
