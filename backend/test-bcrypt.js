// Create a test file: test-bcrypt.js
const bcrypt = require('bcrypt');

async function test() {
    try {
        const hash = await bcrypt.hash('test', 10);
        console.log('Hash created:', hash);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();