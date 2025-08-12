#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env.local');

function toggleEmulator() {
  try {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    
    const currentValue = content.includes('NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true');
    const newValue = !currentValue;
    
    const newContent = content.replace(
      /NEXT_PUBLIC_USE_FIREBASE_EMULATOR=(true|false)/,
      `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=${newValue}`
    );
    
    fs.writeFileSync(ENV_FILE, newContent);
    
    console.log(`🔥 Firebase emulator ${newValue ? 'ENABLED' : 'DISABLED'}`);
    
    if (newValue) {
      console.log('⚠️  Make sure to start the emulators: firebase emulators:start');
    } else {
      console.log('✅ Now using live Firebase services');
    }
    
  } catch (error) {
    console.error('Error toggling emulator setting:', error.message);
  }
}

toggleEmulator();