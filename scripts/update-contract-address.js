const fs = require('fs');
const path = require('path');

const contractAddress = process.argv[2];

if (!contractAddress) {
  console.error('Please provide the contract address as an argument.');
  process.exit(1);
}

const envPath = path.resolve(__dirname, '..', '.env');

fs.readFile(envPath, 'utf8', (err, data) => {
  if (err) {
    if (err.code === 'ENOENT') {
      // .env file doesn't exist, create it
      fs.writeFile(envPath, `VITE_CONTRACT_ADDRESS=${contractAddress}\n`, 'utf8', (err) => {
        if (err) {
          console.error('Error creating .env file:', err);
        } else {
          console.log(`Successfully created .env file and set VITE_CONTRACT_ADDRESS to ${contractAddress}`);
        }
      });
    } else {
      console.error('Error reading .env file:', err);
    }
  } else {
    let newData;
    if (data.includes('VITE_CONTRACT_ADDRESS')) {
      newData = data.replace(/VITE_CONTRACT_ADDRESS=.*/, `VITE_CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      newData = data + `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFile(envPath, newData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to .env file:', err);
      } else {
        console.log(`Successfully updated VITE_CONTRACT_ADDRESS to ${contractAddress} in .env file`);
      }
    });
  }
});
