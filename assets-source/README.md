# Bundled models

The two upstream GLB models are stored here as gzip/base64 chunks to keep each GitHub transfer small. `npm ci`, `npm run dev`, and `npm run build` restore the exact bytes into `public/assets/` if missing and verify SHA-256. The browser loads ordinary GLB files, not these transport chunks.

To replace a model, upload a compatible `archive-cassette.glb` or `archive-assembly.glb` directly into `public/assets/`. An existing model takes precedence and is never overwritten by restoration. Keep upstream attribution and mesh/material names. The JSON manifest lists the chunk order and expected original hashes.
