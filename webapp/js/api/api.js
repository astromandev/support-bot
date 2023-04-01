const express = require('express');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const yourApiKey = 'miketangoalphabravo';
const encryptionKey = 'your_encryption_key_here';

app.get('/api/:api-key/v1/data', (req, res) => {
  if (req.params['api-key'] !== yourApiKey) {
    res.status(401).json({ error: 'Unauthorized access: Invalid API key' });
    return;
  }

  const dataFolder = 'data';
  const dataset = {};

  fs.readdirSync(dataFolder).forEach((file) => {
    const content = fs.readFileSync(path.join(dataFolder, file), 'utf-8');
    const lines = content.split('\n');
    const error = lines[0].replace('Error: ', '');
    const solution = lines[2].replace('Solution: ', '');
    dataset[error] = solution;
  });

  const plaintext = JSON.stringify(dataset);
  const ciphertext = CryptoJS.AES.encrypt(plaintext, encryptionKey).toString();
  res.json({ data: ciphertext });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
