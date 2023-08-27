// import { spawn } from 'child_process';
const { spawn } = require('node:child_process')

function test() {
    const ls = spawn('ls');
    ls.stdout.on('data', (data) => {
        
    });
}

module.exports = { test };