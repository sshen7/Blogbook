import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-char-encryption-key-here!!";

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

export class CryptoService {
  private key: string;

  constructor(key?: string) {
    this.key = key || ENCRYPTION_KEY;
  }

  encrypt(text: string): EncryptedData {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    
    const key = CryptoJS.PBKDF2(this.key, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    return {
      ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv: iv.toString(CryptoJS.enc.Base64),
      salt: salt.toString(CryptoJS.enc.Base64),
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    const salt = CryptoJS.enc.Base64.parse(encryptedData.salt);
    const iv = CryptoJS.enc.Base64.parse(encryptedData.iv);
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedData.ciphertext);

    const key = CryptoJS.PBKDF2(this.key, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any,
      key,
      {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  encryptJSON(data: any): EncryptedData {
    return this.encrypt(JSON.stringify(data));
  }

  decryptJSON<T>(encryptedData: EncryptedData): T {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }

  hashPassword(password: string): string {
    return CryptoJS.SHA256(password + this.key).toString();
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
}

export const cryptoService = new CryptoService();

export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(256 / 8).toString(CryptoJS.enc.Hex);
}

export function encryptNoteContent(content: string, userKey?: string): string {
  const service = userKey ? new CryptoService(userKey) : cryptoService;
  const encrypted = service.encrypt(content);
  return JSON.stringify(encrypted);
}

export function decryptNoteContent(encryptedContent: string, userKey?: string): string {
  try {
    const service = userKey ? new CryptoService(userKey) : cryptoService;
    const encryptedData: EncryptedData = JSON.parse(encryptedContent);
    return service.decrypt(encryptedData);
  } catch (error) {
    console.error("解密失败:", error);
    return encryptedContent;
  }
}
