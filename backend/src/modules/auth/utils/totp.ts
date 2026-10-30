import crypto from "crypto";

// RFC 6238, SHA-1, six digits and a 30-second period.
export function verifyTotp(secret: string, code: string, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = secret.replace(/=+$/, "").toUpperCase();
  if (!/^[A-Z2-7]+$/.test(normalized)) return null;
  let bits = "";
  for (const char of normalized) bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  const key = Buffer.from(bytes);
  if (key.length < 10) return null;
  const step = Math.floor(now / 30000);
  for (const offset of [-1, 0, 1]) {
    const counter = step + offset;
    if (counter < 0) continue;
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter));
    const digest = crypto.createHmac("sha1", key).update(buffer).digest();
    const position = digest[digest.length - 1] & 15;
    const value = (digest.readUInt32BE(position) & 0x7fffffff) % 1000000;
    if (crypto.timingSafeEqual(Buffer.from(value.toString().padStart(6, "0")), Buffer.from(code))) return counter;
  }
  return null;
}
