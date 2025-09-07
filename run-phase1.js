#!/usr/bin/env node

/**
 * Quick Phase 1 Execution Script
 * Run this to execute all Phase 1 tasks
 */

const Phase1Setup = require('./src/automation/scripts/phase1-setup');

console.log('🎯 Starting Phase 1: Core Content Setup');
console.log('=======================================\n');

const setup = new Phase1Setup();
setup.run().then(() => {
    console.log('\n✅ Phase 1 execution completed!');
}).catch(error => {
    console.error('\n❌ Phase 1 execution failed:', error);
    process.exit(1);
});