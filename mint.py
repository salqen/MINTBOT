import json
from web3 import Web3

# Initialize Web3 provider (Infura, local node, etc.)
web3 = Web3(Web3.HTTPProvider('YOUR_INFURA_URL'))

# Load contract ABI
with open('contract_abi.json', 'r') as abi_file:
    contract_abi = json.load(abi_file)

# Set contract address
contract_address = 'CONTRACT_ADDRESS'

# Load your private keys and corresponding wallet addresses
private_keys = ['PRIVATE_KEY_1', 'PRIVATE_KEY_2', ...]
wallet_addresses = ['WALLET_ADDRESS_1', 'WALLET_ADDRESS_2', ...]

# Load contract
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

def mint_nft(wallet_address, qty, proof, timestamp, signature):
    account = web3.eth.account.privateKeyToAccount(private_keys[wallet_addresses.index(wallet_address)])
    
    # Build the transaction
    tx = contract.functions.mint(qty, proof, timestamp, signature).buildTransaction({
        'chainId': web3.eth.chainId,
        'gas': 2000000,  # Adjust the gas limit as needed
        'gasPrice': web3.toWei('100', 'gwei'),
        'nonce': web3.eth.getTransactionCount(account.address),
    })
    
    # Sign the transaction
    signed_tx = web3.eth.account.signTransaction(tx, private_keys[wallet_addresses.index(wallet_address)])
    
    # Send the transaction
    tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)
    
    return tx_hash

# Mint parameters
mint_parameters = [
    {'address': 'WALLET_ADDRESS_1', 'qty': 5, 'proof': '...', 'timestamp': ..., 'signature': '...'},
    {'address': 'WALLET_ADDRESS_2', 'qty': 5, 'proof': '...', 'timestamp': ..., 'signature': '...'},
    # Add more parameters for other wallets
]

# Mint NFTs for each set of parameters
for params in mint_parameters:
    address = params['address']
    qty = params['qty']
    proof = params['proof']
    timestamp = params['timestamp']
    signature = params['signature']
    
    tx_hash = mint_nft(address, qty, proof, timestamp, signature)
    print(f"NFTs minted for {address}. Transaction hash: {tx_hash.hex()}")

print("Minting process completed.")
