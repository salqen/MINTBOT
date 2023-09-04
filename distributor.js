const Web3 = require('web3');

// Replace with your Goerli Infura endpoint
const sepoliaInfuraUrl = 'https://goerli.infura.io/v3/bba22fbe78994589a0f764b756b054fb';

const web3 = new Web3(new Web3.providers.HttpProvider(sepoliaInfuraUrl));

// Replace with your private key
const senderPrivateKey = 'd59a84f274eb619ae7ded43fda94677aba6d7004bf482924c0ac1be0ba5e9778';

// Wallets to distribute ETH to
const receiverWallets = [
    "0x6c3aea4f86e0d45ba8a2c6c1f176b733321a83f0",
    "0x5b479ae35e80d08084f6fd1d535ef4e1dcdd88e0",
    "0x8d798bbf4e7a2aa5cad5939f4060aa280d88e9d6",
    "0x5e592cc90e2bd08aace89f210744c964c79beeb2",
    "0x89beeb54c83c0f14b6e916f7030e9f52d70b87b3",
    "0x8a2d2c002baba4a953ebf43523f8c701bb5f4fe5",
    "0x7b447e7cccde31c3d993c2ab46a2193f415c7b94",
    "0xfc9f4e974c4ff503796e90ac0e20882abc421491",
    "0x513550a6e12264b2c3e8e6ff25f5f751164db31a",
    "0xa37c4d1cb79d850229ae84317da0d43ece92a25c",
    "0x6e83123b369a152555cf144ad892156b5e46f644",
    "0x699c6e6e1908a35a12042ff12b52173819fc8382",
    "0x6f7500ef773f8cf8a089a1d5a23fe101fd0ecc79",
    "0x20a34376d59179114810c80f3015e2affb3d4057",
    "0x227dd83d166ee5d66284b7fa06c0dbceb90b954b",
    "0xcda1ccdac4314cf43962fa371017734e471a8a95",
    "0x483ea7a1c9f4326658fdadfd58be8c5739d51022",
    "0xe435240b3d823bf0972b44dd1538c2b73a599cf7",
    "0xbe8ee84623e95bcd3c205071f27aff7b60f353ad",
    "0x6e789157cb5ede37c03674d92d9b617245b8f2c4",
    "0x68c62c4d599196bc86b5d4b18f0c8f2f50ffbcd4",
    "0x23e2c9b6a0583ee51db6cd1d4097d6d92ab7c9c6",
    "0xff1c8c39bfde3bee207ffcff1d10587731f8c19c"
];

// Amount of ETH to send to each wallet (in Wei)
const amountToSend = web3.utils.toWei('0.01', 'ether'); // 1 ETH

async function distributeETH() {
  const senderAccount = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
  const gasPriceWei = await web3.eth.getGasPrice();

  for (const receiver of receiverWallets) {
    const nonce = await web3.eth.getTransactionCount(senderAccount.address);
    
    const tx = {
      from: senderAccount.address,
      to: receiver,
      value: amountToSend,
      gas: 21000, // Gas limit for a standard Ether transfer
      gasPrice: gasPriceWei,
      nonce,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, senderPrivateKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`ETH sent to ${receiver}. Transaction Hash: ${txHash}`);
  }
}

distributeETH();
