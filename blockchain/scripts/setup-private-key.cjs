const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupPrivateKey() {
  console.log('🔐 Frame Breaker Private Key Setup');
  console.log('==================================\n');

  try {
    // Check if .env exists
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found. Creating from template...');
      const envExamplePath = path.join(process.cwd(), 'env.example');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created from template');
      } else {
        console.log('❌ env.example not found. Creating basic .env...');
        fs.writeFileSync(envPath, '# Environment Variables\n');
      }
    }

    console.log('\n📝 Private Key Setup Options:');
    console.log('1. Enter private key directly');
    console.log('2. Set environment variable manually');
    console.log('3. Skip for now (manual setup later)');

    const choice = await question('\nChoose option (1-3): ');

    switch (choice) {
      case '1':
        await setupDirectPrivateKey(envPath);
        break;
      case '2':
        await setupEnvironmentVariable();
        break;
      case '3':
        console.log('\n⏭️  Skipping private key setup.');
        console.log('You can manually edit .env file later.');
        break;
      default:
        console.log('\n❌ Invalid choice. Exiting...');
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Get Base Sepolia ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
    console.log('2. Deploy contract: npx hardhat run scripts/deploy.js --network baseSepolia');
    console.log('3. Update CONTRACT_ADDRESS in src/App.tsx');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

async function setupDirectPrivateKey(envPath) {
  console.log('\n⚠️  WARNING: Keep your private key secure and never share it!');
  console.log('Only use this for development/testing wallets.\n');

  const privateKey = await question('Enter your private key (without 0x prefix): ');
  
  if (!privateKey || privateKey.length !== 64) {
    console.log('❌ Invalid private key format. Should be 64 characters.');
    return;
  }

  // Read existing .env content
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update or add PRIVATE_KEY
  if (envContent.includes('PRIVATE_KEY=')) {
    envContent = envContent.replace(/PRIVATE_KEY=.*/, `PRIVATE_KEY=${privateKey}`);
  } else {
    envContent += `\nPRIVATE_KEY=${privateKey}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Private key saved to .env file');
}

async function setupEnvironmentVariable() {
  console.log('\n🌍 Environment Variable Setup');
  console.log('=============================');
  
  console.log('Set your private key as an environment variable:');
  console.log('');
  console.log('Windows Command Prompt:');
  console.log('  set PRIVATE_KEY=your_private_key_here');
  console.log('');
  console.log('PowerShell:');
  console.log('  $env:PRIVATE_KEY="your_private_key_here"');
  console.log('');
  console.log('Linux/Mac:');
  console.log('  export PRIVATE_KEY=your_private_key_here');
  console.log('');
  console.log('✅ Environment variable setup complete');
  console.log('The hardhat.config.js will automatically detect the PRIVATE_KEY environment variable');
}

// Run the setup
setupPrivateKey().catch(console.error);
