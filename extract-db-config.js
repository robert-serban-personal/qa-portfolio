#!/usr/bin/env node
// Database URL Parser for Vercel Environment Variables
// This script helps extract database connection details from DATABASE_URL

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Database Configuration Extractor');
console.log('=====================================');
console.log('');
console.log('This script will help you extract database connection details from your DATABASE_URL.');
console.log('');
console.log('📋 Steps to get your DATABASE_URL:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your project (qa-portfolio)');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Copy the value of DATABASE_URL');
console.log('');
console.log('Paste your DATABASE_URL here (it will be hidden for security):');

rl.question('', (databaseUrl) => {
  try {
    // Parse the DATABASE_URL
    const url = new URL(databaseUrl);
    
    console.log('');
    console.log('✅ Database Configuration Extracted:');
    console.log('=====================================');
    console.log(`DB_HOST: ${url.hostname}`);
    console.log(`DB_PORT: ${url.port || 5432}`);
    console.log(`DB_NAME: ${url.pathname.substring(1)}`);
    console.log(`DB_USER: ${url.username}`);
    console.log(`DB_PASSWORD: ${url.password}`);
    console.log('');
    console.log('🔧 For your testing framework .env file:');
    console.log('=========================================');
    console.log(`DB_HOST=${url.hostname}`);
    console.log(`DB_PORT=${url.port || 5432}`);
    console.log(`DB_NAME=${url.pathname.substring(1)}`);
    console.log(`DB_USER=${url.username}`);
    console.log(`DB_PASSWORD=${url.password}`);
    console.log('');
    console.log('⚠️  Keep these credentials secure!');
    
  } catch (error) {
    console.log('');
    console.log('❌ Error parsing DATABASE_URL:', error.message);
    console.log('Please make sure you copied the complete URL correctly.');
  }
  
  rl.close();
});

// Hide input for security
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (stringToWrite !== '\r\n') {
    rl.output.write('*');
  } else {
    rl.output.write(stringToWrite);
  }
};

