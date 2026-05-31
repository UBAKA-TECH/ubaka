// Simple AES-GCM encryption/decryption using native browser SubtleCrypto

/**
 * Derives a cryptographic key from a passphrase and a salt.
 */
async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext string using a passphrase.
 * Returns a formatted string: [E2EE-AES-GCM]:saltHex:ivHex:ciphertextHex
 */
export async function encryptMessage(text, passphrase) {
  if (!text || !passphrase) return text;
  try {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(text)
    );

    // Convert arrays to hex strings
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const payloadHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `[E2EE-AES-GCM]:${saltHex}:${ivHex}:${payloadHex}`;
  } catch (err) {
    console.error("Encryption failed:", err);
    return text;
  }
}

/**
 * Decrypts an E2EE string using a passphrase.
 * If the string is not encrypted, returns it as is.
 * If decryption fails, returns a specific fallback or error message.
 */
export async function decryptMessage(encryptedStr, passphrase) {
  if (!encryptedStr || !passphrase) return encryptedStr;
  if (!encryptedStr.startsWith("[E2EE-AES-GCM]:")) return encryptedStr;

  try {
    const parts = encryptedStr.split(":");
    if (parts.length < 4) return "[Decryption Error: Invalid E2EE format]";
    
    const saltHex = parts[1];
    const ivHex = parts[2];
    const payloadHex = parts[3];

    // Convert hex strings back to arrays
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const payload = new Uint8Array(payloadHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const key = await deriveKey(passphrase, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      payload
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.warn("Decryption failed (likely incorrect passphrase):", err.message);
    return "[Decryption Error: Incorrect passphrase]";
  }
}
