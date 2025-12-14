#!/usr/bin/env node

/**
 * Setup script for Friday Discord Bot
 * Builds TypeScript code and runs the bot
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute a command and stream output
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {string} description - Description of the step
 * @returns {Promise<number>} Exit code
 */
function executeCommand(command, args, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${description}`);
        console.log(`${'='.repeat(60)}\n`);

        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            cwd: __dirname
        });

        child.on('error', (error) => {
            reject(error);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${description} failed with exit code ${code}`));
            } else {
                console.log(`\n✓ ${description} completed successfully\n`);
                resolve(code);
            }
        });
    });
}

/**
 * Main setup function
 */
async function setup() {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   Friday Bot - Setup & Run Script    ║');
        console.log('╚════════════════════════════════════════╝\n');

        // Step 1: Install dependencies
        await executeCommand('npm', ['install'], 'Installing dependencies');

        // Step 2: Build TypeScript code
        await executeCommand('npm', ['run', 'build'], 'Building TypeScript code');

        // Step 3: Run the bot
        console.log('\n' + '='.repeat(60));
        console.log('Starting the bot...');
        console.log('='.repeat(60) + '\n');

        // Run the bot (this will keep running)
        const botProcess = spawn('node', ['dist/shards.js'], {
            stdio: 'inherit',
            shell: true,
            cwd: __dirname
        });

        botProcess.on('error', (error) => {
            console.error('\n✗ Failed to start the bot:', error);
            process.exit(1);
        });

        botProcess.on('close', (code) => {
            console.log(`\nBot process exited with code ${code}`);
            process.exit(code || 0);
        });

        // Handle termination signals
        process.on('SIGINT', () => {
            console.log('\n\nReceived SIGINT, shutting down...');
            botProcess.kill('SIGINT');
        });

        process.on('SIGTERM', () => {
            console.log('\n\nReceived SIGTERM, shutting down...');
            botProcess.kill('SIGTERM');
        });

    } catch (error) {
        console.error('\n✗ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup
setup();
