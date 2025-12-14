#!/usr/bin/env node
/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Automated setup script for Friday Discord Bot
 * This script handles installation, TypeScript compilation, and bot startup
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const STEPS = {
    CHECK_ENV: 'Checking environment',
    INSTALL_DEPS: 'Installing dependencies',
    BUILD_TS: 'Building TypeScript',
    START_BOT: 'Starting bot'
};

let currentStep = 0;
const totalSteps = Object.keys(STEPS).length;

/**
 * Print a formatted header
 */
function printHeader() {
    console.log(chalk.cyan.bold('\n╔══════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║                                                      ║'));
    console.log(chalk.cyan.bold('║          Friday Discord Bot - Setup Script          ║'));
    console.log(chalk.cyan.bold('║                                                      ║'));
    console.log(chalk.cyan.bold('║  Author: Tanmay                                      ║'));
    console.log(chalk.cyan.bold('║  Recoded by: Nerox Studios                           ║'));
    console.log(chalk.cyan.bold('║  Version: v2-alpha-1                                 ║'));
    console.log(chalk.cyan.bold('║                                                      ║'));
    console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════╝\n'));
}

/**
 * Print step progress
 */
function printStep(step) {
    currentStep++;
    console.log(chalk.yellow(`\n[${currentStep}/${totalSteps}] ${step}...`));
}

/**
 * Print success message
 */
function printSuccess(message) {
    console.log(chalk.green('✓ ' + message));
}

/**
 * Print error message
 */
function printError(message) {
    console.error(chalk.red('✗ ' + message));
}

/**
 * Print warning message
 */
function printWarning(message) {
    console.warn(chalk.yellow('⚠ ' + message));
}

/**
 * Run a command and return a promise
 */
function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: options.silent ? 'pipe' : 'inherit',
            shell: true,
            cwd: __dirname,
            ...options
        });

        let stdout = '';
        let stderr = '';

        if (options.silent) {
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
        }

        child.on('error', (error) => {
            reject(error);
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr, code });
            } else {
                reject(new Error(`Command failed with exit code ${code}\n${stderr}`));
            }
        });
    });
}

/**
 * Check if .env file exists
 */
function checkEnvironment() {
    printStep(STEPS.CHECK_ENV);
    
    const envPath = join(__dirname, '.env');
    const envExamplePath = join(__dirname, '.env.example');
    
    if (!existsSync(envPath)) {
        if (existsSync(envExamplePath)) {
            printWarning('.env file not found. Please copy .env.example to .env and configure it.');
            printWarning('Setup will continue, but you need to configure .env before running the bot.');
        } else {
            printWarning('.env file not found. Make sure to create one with your bot token.');
        }
    } else {
        printSuccess('Environment file found');
    }
    
    const configPath = join(__dirname, 'config.json');
    if (!existsSync(configPath)) {
        printError('config.json not found! Please create config.json with your bot configuration.');
        return false;
    } else {
        printSuccess('Configuration file found');
    }
    
    return true;
}

/**
 * Install dependencies
 */
async function installDependencies() {
    printStep(STEPS.INSTALL_DEPS);
    
    const nodeModulesPath = join(__dirname, 'node_modules');
    
    if (existsSync(nodeModulesPath)) {
        console.log(chalk.gray('  Dependencies already installed, checking for updates...'));
    }
    
    try {
        console.log(chalk.gray('  Running: npm install'));
        await runCommand('npm', ['install']);
        printSuccess('Dependencies installed successfully');
        return true;
    } catch (error) {
        printError('Failed to install dependencies');
        console.error(error.message);
        return false;
    }
}

/**
 * Build TypeScript
 */
async function buildTypeScript() {
    printStep(STEPS.BUILD_TS);
    
    const distPath = join(__dirname, 'dist');
    
    try {
        console.log(chalk.gray('  Running: npm run build'));
        await runCommand('npm', ['run', 'build']);
        printSuccess('TypeScript compiled successfully');
        
        if (!existsSync(distPath)) {
            printWarning('dist/ folder not found after build');
            return false;
        }
        
        return true;
    } catch (error) {
        printError('Failed to build TypeScript');
        console.error(error.message);
        return false;
    }
}

/**
 * Start the bot
 */
async function startBot() {
    printStep(STEPS.START_BOT);
    
    const shardsPath = join(__dirname, 'dist', 'shards.js');
    
    if (!existsSync(shardsPath)) {
        printError('dist/shards.js not found. Build may have failed.');
        return false;
    }
    
    console.log(chalk.gray('  Running: npm start'));
    console.log(chalk.cyan('\n────────────────────────────────────────────────────────\n'));
    console.log(chalk.green.bold('Bot is starting...\n'));
    console.log(chalk.gray('Press Ctrl+C to stop the bot\n'));
    console.log(chalk.cyan('────────────────────────────────────────────────────────\n'));
    
    try {
        await runCommand('npm', ['start']);
        return true;
    } catch (error) {
        printError('Bot stopped or failed to start');
        if (error.message.includes('SIGINT') || error.message.includes('SIGTERM')) {
            console.log(chalk.yellow('\nBot stopped by user'));
        } else {
            console.error(error.message);
        }
        return false;
    }
}

/**
 * Main setup function
 */
async function main() {
    printHeader();
    
    console.log(chalk.white('This script will:'));
    console.log(chalk.gray('  1. Check your environment configuration'));
    console.log(chalk.gray('  2. Install all required dependencies'));
    console.log(chalk.gray('  3. Build TypeScript source code'));
    console.log(chalk.gray('  4. Start the Discord bot\n'));
    
    try {
        // Step 1: Check environment
        const envOk = checkEnvironment();
        if (!envOk) {
            printError('Environment check failed. Please fix the issues and run setup again.');
            process.exit(1);
        }
        
        // Step 2: Install dependencies
        const depsOk = await installDependencies();
        if (!depsOk) {
            printError('Failed to install dependencies. Setup aborted.');
            process.exit(1);
        }
        
        // Step 3: Build TypeScript
        const buildOk = await buildTypeScript();
        if (!buildOk) {
            printError('Failed to build TypeScript. Setup aborted.');
            process.exit(1);
        }
        
        // Step 4: Start the bot
        console.log(chalk.green.bold('\n✓ Setup completed successfully!\n'));
        await startBot();
        
    } catch (error) {
        printError('An unexpected error occurred during setup');
        console.error(error);
        process.exit(1);
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nSetup interrupted by user'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n\nSetup terminated'));
    process.exit(0);
});

// Run the setup
main().catch(error => {
    printError('Fatal error during setup');
    console.error(error);
    process.exit(1);
});
