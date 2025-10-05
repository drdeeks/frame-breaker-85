#!/usr/bin/env python3
"""
Interactive Keystore Import Script
Creates a keystore file from a private key with password protection.
Hides sensitive information during input.
"""

import json
import os
import sys
import getpass
from datetime import datetime, timezone
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import secrets
import base64

class KeystoreManager:
    def __init__(self):
        self.backend = default_backend()
    
    def derive_key(self, password: str, salt: bytes, iterations: int = 100000) -> bytes:
        """Derive encryption key from password using PBKDF2"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=iterations,
            backend=self.backend
        )
        return kdf.derive(password.encode('utf-8'))
    
    def encrypt_private_key(self, private_key: str, password: str) -> dict:
        """Encrypt private key with AES-256-CBC"""
        # Generate random salt and IV
        salt = secrets.token_bytes(32)
        iv = secrets.token_bytes(16)
        
        # Derive key from password
        key = self.derive_key(password, salt)
        
        # Encrypt private key
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=self.backend)
        encryptor = cipher.encryptor()
        
        # Pad private key to block size
        private_key_bytes = private_key.encode('utf-8')
        padding_length = 16 - (len(private_key_bytes) % 16)
        padded_key = private_key_bytes + bytes([padding_length] * padding_length)
        
        ciphertext = encryptor.update(padded_key) + encryptor.finalize()
        
        return {
            'version': '1.0',
            'crypto': {
                'cipher': 'aes-256-cbc',
                'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
                'kdf': 'pbkdf2',
                'kdfparams': {
                    'salt': base64.b64encode(salt).decode('utf-8'),
                    'iterations': 100000,
                    'keylen': 32,
                    'digest': 'sha256'
                },
                'iv': base64.b64encode(iv).decode('utf-8')
            },
            'id': secrets.token_hex(16),
            'created': datetime.now(timezone.utc).isoformat()
        }
    
    def validate_private_key(self, private_key: str) -> bool:
        """Basic validation of private key format"""
        # Remove whitespace
        private_key = private_key.strip()
        
        # Check if it's a hex string (common format)
        if len(private_key) == 64:
            try:
                int(private_key, 16)
                return True
            except ValueError:
                pass
        
        # Check if it's a base64 string
        if len(private_key) > 40:
            try:
                decoded = base64.b64decode(private_key)
                if len(decoded) == 32:  # 256-bit key
                    return True
            except Exception:
                pass
        
        return False

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def secure_input(prompt: str, hide_input: bool = True) -> str:
    """Get secure input from user"""
    if hide_input:
        return getpass.getpass(prompt)
    else:
        return input(prompt)

def main():
    print("=" * 60)
    print("🔐 INTERACTIVE KEYSTORE IMPORT UTILITY")
    print("=" * 60)
    print("This tool will create an encrypted keystore from your private key.")
    print("All sensitive information will be hidden during input.\n")
    
    keystore_manager = KeystoreManager()
    
    try:
        # Get private key (hidden input)
        print("Step 1: Enter your private key")
        print("Supported formats: 64-character hex string (with or without 0x prefix) or base64")
        private_key = secure_input("🔑 Private Key (hidden): ", hide_input=True)
        
        if not private_key.strip():
            print("❌ Error: Private key cannot be empty!")
            sys.exit(1)
        
        # Validate private key
        if not keystore_manager.validate_private_key(private_key):
            print("⚠️  Warning: Private key format may not be valid.")
            confirm = input("Continue anyway? (y/N): ").strip().lower()
            if confirm != 'y':
                print("Operation cancelled.")
                sys.exit(1)
        
        # Get password for keystore encryption
        print("\nStep 2: Create a password to protect your keystore")
        while True:
            password = secure_input("🔒 Enter password (hidden): ", hide_input=True)
            if not password.strip():
                print("❌ Password cannot be empty!")
                continue
            
            password_confirm = secure_input("🔒 Confirm password (hidden): ", hide_input=True)
            if password != password_confirm:
                print("❌ Passwords don't match! Please try again.")
                continue
            break
        
        # Get output filename
        print("\nStep 3: Choose output file")
        default_filename = f"keystore_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filename = input(f"📁 Keystore filename [{default_filename}]: ").strip()
        if not filename:
            filename = default_filename
        
        # Ensure .json extension
        if not filename.endswith('.json'):
            filename += '.json'
        
        # Check if file already exists
        if os.path.exists(filename):
            overwrite = input(f"⚠️  File '{filename}' exists. Overwrite? (y/N): ").strip().lower()
            if overwrite != 'y':
                print("Operation cancelled.")
                sys.exit(1)
        
        # Create encrypted keystore
        print("\n🔄 Creating encrypted keystore...")
        keystore_data = keystore_manager.encrypt_private_key(private_key, password)
        
        # Save to file
        with open(filename, 'w') as f:
            json.dump(keystore_data, f, indent=2)
        
        # Clear sensitive data from memory
        private_key = '0' * len(private_key)
        password = '0' * len(password)
        password_confirm = '0' * len(password_confirm)
        
        print("✅ Keystore created successfully!")
        print(f"📁 File: {filename}")
        print(f"🆔 Keystore ID: {keystore_data['id']}")
        print(f"📅 Created: {keystore_data['created']}")
        print("\n⚠️  IMPORTANT SECURITY NOTES:")
        print("• Keep your password safe - it cannot be recovered!")
        print("• Store the keystore file in a secure location")
        print("• Consider making encrypted backups")
        print("• Never share your private key or password")
        
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
