import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const salt = crypto.randomBytes(16);

export async function hashPassword(password: string) {
  const hashedPassword = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      (err: any, derivedKey: Buffer) => {
        if (err) reject(err);
        console.log("no error, returned derivedKey");
        resolve(derivedKey);
      }
    );
  });
  return {
    hashedPassword: hashedPassword.toString("hex"),
    salt: salt.toString("hex"),
  };
}

export async function comparePassword(password :string,storedHashedPassword : string,salt:string) {
  const result = await new Promise<boolean>((resolve, reject) => {
    crypto.pbkdf2(
      password,
      Buffer.from(salt,"hex"),
      310000,
      32,
      "sha256",
      (err: Error | null, hashedPassword: Buffer) => {
        if (err) reject(err);
        if (!crypto.timingSafeEqual(
          Buffer.from(storedHashedPassword,"hex"),
          hashedPassword
        )) {
          return false;
        }
        return true;
      }
    );
  });
  return result;
}
