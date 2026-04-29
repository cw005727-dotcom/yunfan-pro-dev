import base64
import hashlib
import secrets

def generate_pkce():
    # Generate code verifier
    verifier = secrets.token_urlsafe(32)
    
    # Generate code challenge
    sha256_hash = hashlib.sha256(verifier.encode('ascii')).digest()
    challenge = base64.urlsafe_b64encode(sha256_hash).decode('ascii').rstrip('=')
    
    return verifier, challenge

if __name__ == "__main__":
    verifier, challenge = generate_pkce()
    with open("pkce_data.txt", "w") as f:
        f.write(f"verifier:{verifier}\n")
        f.write(f"challenge:{challenge}\n")
    
    print(f"CHALLENGE:{challenge}")
    print(f"VERIFIER:{verifier}")
