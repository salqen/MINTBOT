const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const privateKey = '0x82ad8b19b2d3f9a25818ed27a636fac7843d0e53b820931ebfbd9e760c87c6e6'; // Replace with the private key of the wallet

const web3 = new Web3(); // Initialize Web3

const minter = '0x6c3aea4f86e0d45ba8a2c6c1f176b733321a83f0'; // Address of the minter
const qty = 1; // Quantity
const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

// Create the message hash
const message = web3.utils.soliditySha3(
  { t: 'address', v: minter },
  { t: 'uint32', v: qty },
  { t: 'uint64', v: timestamp }
);

// Sign the message using the private key
const signature = ethUtil.ecsign(Buffer.from(message.slice(2), 'hex'), Buffer.from(privateKey.slice(2), 'hex'));

// Concatenate the signature components
const signatureBytes = '0x' +
  signature.r.toString('hex') +
  signature.s.toString('hex') +
  signature.v.toString(16);

console.log('Generated Signature:', signatureBytes);
