// Workaround script to generate Prisma client without downloading engines
const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'node_modules', '.prisma', 'client');

// Ensure directory exists
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

// Create minimal runtime files
const defaultJs = `
// Generated Prisma Client (workaround - engines not available)
throw new Error('@prisma/client could not be generated due to network restrictions. Engines must be provided at runtime.');
`;

fs.writeFileSync(path.join(clientDir, 'default.js'), defaultJs);
fs.writeFileSync(path.join(clientDir, 'edge.js'), defaultJs);
fs.writeFileSync(path.join(clientDir, 'wasm.js'), defaultJs);

console.log('Prisma client workaround files created');
