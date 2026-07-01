/**
 * Zero-Knowledge Cryptography implementation using Web Crypto API.
 */

// Helper to convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Helper to convert ArrayBuffer to string
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives an AES-GCM encryption key from a master password.
 * @param password The master password
 * @param salt The salt (e.g., user ID)
 * @returns The CryptoKey for encryption/decryption
 */
export async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    stringToArrayBuffer(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: stringToArrayBuffer(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext string using the provided key.
 * @param text The plaintext string to encrypt
 * @param key The AES-GCM CryptoKey
 * @returns An object containing the base64 encoded ciphertext and IV
 */
export async function encryptText(text: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encodedText = stringToArrayBuffer(text);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedText
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

/**
 * Decrypts a base64 encoded ciphertext using the provided key and IV.
 * @param ciphertext The base64 encoded ciphertext
 * @param iv The base64 encoded IV
 * @param key The AES-GCM CryptoKey
 * @returns The decrypted plaintext string
 */
export async function decryptText(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(ciphertext);
  const ivBuffer = base64ToArrayBuffer(iv);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer
      },
      key,
      encryptedBuffer
    );

    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed. Incorrect key or corrupted data.", error);
    throw new Error("Decryption failed");
  }
}
