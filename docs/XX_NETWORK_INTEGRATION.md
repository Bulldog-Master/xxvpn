# xx Network cMixx Integration Guide

This document explains how to integrate the xx network's cMixx protocol for decentralized, quantum-resistant VPN functionality.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  ┌────────────────┐        ┌──────────────────┐                 │
│  │  React App     │◄──────►│  xxDK WASM       │                 │
│  │  (UI Layer)    │        │  (cMixx Client)  │                 │
│  └────────────────┘        └──────────────────┘                 │
│         │                           │                            │
│         │                           │                            │
└─────────┼───────────────────────────┼────────────────────────────┘
          │                           │
          │                           │ Direct P2P
          │                           │ Quantum-Resistant
          │                           │ Metadata Shredding
          │                           ▼
          │                  ┌─────────────────┐
          │                  │  xx cMixx       │
          │                  │  Mixnet Nodes   │
          │                  └─────────────────┘
          │                           │
          │                           ▼
          │                  ┌─────────────────┐
          │                  │  Destination    │
          │                  │  Server         │
          ▼                  └─────────────────┘
┌──────────────────┐
│  Edge Functions  │
│  (NDF, Health)   │
└──────────────────┘
```

## Core Components

### 1. WebAssembly Module (xxdk-wasm)
- **Repository**: https://git.xx.network/elixxir/xxdk-wasm
- **Language**: Go compiled to WASM
- **Size**: ~10-15 MB (compressed)
- **Features**:
  - Quantum-resistant encryption (post-quantum cryptography)
  - Metadata shredding via cMixx protocol
  - P2P mixnet routing
  - End-to-end encrypted messaging

### 2. Edge Functions (Supporting Infrastructure)
- **NDF Retrieval**: Fetch Network Definition File from trusted gateways
- **Node Health Monitoring**: Track xx network node status
- **Key Management**: Secure storage of reception identities

### 3. Frontend Integration
- WASM loader with lazy loading
- Connection state management
- Real-time network health display
- Reception identity management

## Building the WASM Module

### Prerequisites
```bash
# Install Go 1.21+
# Install TinyGo for WASM compilation
brew install tinygo  # macOS
# or
apt-get install tinygo  # Linux
```

### Clone and Build
```bash
# Clone the xxdk-wasm repository
git clone https://git.xx.network/elixxir/xxdk-wasm.git
cd xxdk-wasm

# Build WASM module
make wasm

# Output: xxdk.wasm and wasm_exec.js
```

### Deploy to Project
```bash
# Copy built WASM to public folder
cp xxdk.wasm /path/to/project/public/wasm/
cp wasm_exec.js /path/to/project/public/wasm/
```

## Network Definition File (NDF)

The NDF contains:
- List of active mixnet nodes
- Network configuration
- Gateway endpoints
- Cryptographic parameters

**Production NDF**: https://elixxir-bins.s3.us-west-1.amazonaws.com/ndf/mainnet.json

## Security Considerations

### Client Keystore
- Encrypted with user password
- Stored in browser IndexedDB
- Contains cryptographic keys for cMixx
- **CRITICAL**: Never expose to backend or logs

### Reception Identity
- Your "address" on the xx network
- Used to receive messages/connections
- Can be shared publicly (like a public key)
- Private keys stay in keystore

### Quantum Resistance
- Uses post-quantum key exchange (SIDH/CSIDH)
- Protects against quantum computer attacks
- Future-proof cryptography

## Performance Metrics

### Initial Load
- WASM download: ~10 MB (one-time)
- Initialization: ~2-3 seconds
- Network sync: ~5-10 seconds

### Runtime
- Message latency: ~500ms - 2s (mixnet overhead)
- Bandwidth: Minimal overhead (~10-15%)
- Memory: ~50-100 MB

## Development Workflow

### 1. Local Testing
```bash
# Start with mock WASM for faster development
npm run dev

# Test with real WASM (slower initial load)
VITE_USE_REAL_WASM=true npm run dev
```

### 2. Production Deployment
```bash
# Build with real WASM enabled
npm run build

# Deploy WASM to CDN for faster loading
```

## Troubleshooting

### WASM Load Failures
- Check browser WASM support (Chrome 57+, Firefox 52+)
- Verify CORS headers for WASM files
- Check file size limits

### Network Connection Issues
- Verify NDF is accessible
- Check gateway connectivity
- Review browser console for cMixx errors

### Performance Issues
- Enable WASM streaming compilation
- Use Web Workers for heavy operations
- Implement proper loading states

## References

- [xx Network Documentation](https://learn.xx.network/)
- [xxDK API Reference](https://xxdk-dev.xx.network/)
- [cMixx Protocol Paper](https://xx.network/cMixx-white-paper.pdf)
- [WebAssembly Bindings](https://git.xx.network/elixxir/xxdk-wasm)
