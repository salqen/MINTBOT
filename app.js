const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const Web3 = require('web3');
const ethUtil = require('ethereumjs-util');
const contractABI = require('./contractABI.json');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const app = express();
const port = process.env.PORT || 3000;

const ethereumTestnetUrl = "https://goerli.infura.io/v3/d1d8fc6c9b784625b2ce463601228dc2";
const web3 = new Web3(new Web3.providers.HttpProvider(ethereumTestnetUrl));
const contractAddress = "0x251563c91093651C59357731156a7aacA073F40A";
const contract = new web3.eth.Contract(contractABI, contractAddress);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let merkleTree;
const minterAddresses = [];

fs.createReadStream('wallets.csv')
    .pipe(csv())
    .on('data', (row) => {
        console.log(`Reading address from CSV: ${row.address}`);
        minterAddresses.push(row.address);
    })
    .on('end', () => {
        console.log(`Finished reading minter addresses. Total: ${minterAddresses.length}`);
        const leaves = minterAddresses.map(address => keccak256(address));
        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    });

app.post('/start-minting', async (req, res) => {
    try {
        await startMinting();
        res.json({ message: 'Minting started.' });
    } catch (error) {
        console.error('Error in /start-minting:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

async function startMinting() {
    const readStream = fs.createReadStream('privatekeys.csv').pipe(csv());

    for await (const row of readStream) {
        try {
            const privateKey = '0x' + row.privatekey;
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            let nonce = await web3.eth.getTransactionCount(account.address);
            const mintQty = 1;

            for (const minter of minterAddresses) {
                const merkleProof = await getMerkleProof(minter);
                
                const timestamp = Math.floor(Date.now() / 1000);
                const message = web3.utils.soliditySha3(
                    { t: 'address', v: account.address },
                    { t: 'uint32', v: mintQty },
                    { t: 'uint64', v: timestamp }
                );
                const signature = ethUtil.ecsign(
                    Buffer.from(message.slice(2), 'hex'),
                    Buffer.from(privateKey.slice(2), 'hex')
                );
                const signatureBytes = '0x' +
                    signature.r.toString('hex') +
                    signature.s.toString('hex') +
                    signature.v.toString(16);

                // Mint tokens
                const mintFunction = contract.methods.mint(
                    mintQty,
                    merkleProof,
                    timestamp,
                    signatureBytes
                );
                const mintTransactionObject = {
                    from: account.address,
                    to: contractAddress,
                    gas: "500000",
                    gasPrice: await web3.eth.getGasPrice(),
                    nonce: nonce++,
                    value: "10000000000000000",
                    data: mintFunction.encodeABI(),
                    chainId: 5
                };
                const signedMintTransaction = await web3.eth.accounts.signTransaction(mintTransactionObject, privateKey);
                await web3.eth.sendSignedTransaction(signedMintTransaction.rawTransaction);

                // Transfer the minted token to the minter's address
                const zeroAddress = '0x0000000000000000000000000000000000000000';
                const transferFromFunction = contract.methods.transferFrom(zeroAddress, minter, mintQty);
                const transferFromTransactionObject = {
                    from: account.address,
                    to: contractAddress,
                    gas: "200000",
                    gasPrice: await web3.eth.getGasPrice(),
                    nonce: nonce++,
                    data: transferFromFunction.encodeABI(),
                    chainId: 5
                };
                const signedTransferFromTransaction = await web3.eth.accounts.signTransaction(transferFromTransactionObject, privateKey);
                await web3.eth.sendSignedTransaction(signedTransferFromTransaction.rawTransaction);
            }
        } catch (error) {
            console.error('Error in minting:', error);
        }
    }
}

async function getMerkleProof(minterAddress) {
    const leafNode = keccak256(minterAddress);
    const proof = merkleTree.getHexProof(leafNode);
    const rootHash = merkleTree.getRoot().toString('hex');
    const isProofValid = merkleTree.verify(proof, leafNode, rootHash);

    if (!isProofValid) {
        throw new Error('Merkle proof verification failed.');
    }

    return proof;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
