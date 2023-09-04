from eth_keys import keys

def generate_wallet_address(private_key):
    private_key_bytes = bytes.fromhex(private_key)
    private_key_object = keys.PrivateKey(private_key_bytes)
    wallet_address = private_key_object.public_key.to_checksum_address()
    return wallet_address

# Read private keys from a file
private_keys_file_path = 'C:/Users/salok/OneDrive/Počítač/AUTOMINT_PY/privateKeys.txt'
private_keys = []

with open(private_keys_file_path, 'r') as file:
    for line in file:
        private_key = line.strip()  # Remove newline characters
        private_keys.append(private_key)

# Generate and print wallet addresses
for private_key in private_keys:
    wallet_address = generate_wallet_address(private_key)
    print("Generated Wallet Address:", wallet_address)
