import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

try {
    const epub2 = require('epub2');
    console.log('Type of require("epub2"):', typeof epub2);
    console.log('Keys of require("epub2"):', Object.keys(epub2));
    console.log('Is it a constructor?', typeof epub2 === 'function' ? 'Yes' : 'No');
    if (epub2.default) {
        console.log('Type of epub2.default:', typeof epub2.default);
    }
} catch (e) {
    console.error('Error requiring epub2:', e);
}
