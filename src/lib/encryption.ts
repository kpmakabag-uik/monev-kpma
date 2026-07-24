import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "temporary_default_key_for_simonev_development_32_bytes"; // Must be 32 bytes/characters
const IV_LENGTH = 12; // For AES-256-GCM

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    // Format: iv:encrypted:authTag
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return text; // fallback to plain text if error occurs
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return encryptedData; // not our encrypted format
    
    const [ivHex, encryptedHex, authTagHex] = parts;
    if (!ivHex || !encryptedHex || !authTagHex) return encryptedData; 
    
    // Validate IV length for AES-256-GCM (12 bytes = 24 hex chars)
    if (ivHex.length !== 24) return encryptedData;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return encryptedData; // fallback
  }
}
