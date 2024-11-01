// import crypto from "crypto";

import {
    genSaltSync,
    hashSync,
    compareSync,
  } from 'bcrypt-edge';

// const salt = crypto.randomBytes(16);

export async function hashPassword(password: string) {
//   const hashedPassword = await new Promise<Buffer>((resolve, reject) => {
//     crypto.pbkdf2(
//       password,
//       salt,
//       310000,
//       32,
//       "sha256",
//       (err: any, derivedKey: Buffer) => {
//         if (err) reject(err);
//         console.log("no error, returned derivedKey");
//         resolve(derivedKey);
//       }
//     );
//   });
//   return {
//     hashedPassword: hashedPassword.toString("hex"),
//     salt: salt.toString("hex"),
//   };
const salt = genSaltSync(10);
const hash = hashSync(password,salt);

if (!salt || !hash) {
    throw Error("failed to hash password");
}

return{
    hashedPassword : hash,
    salt
}

}

export async function comparePassword(password :string,storedHashedPassword : string,salt:string) {
//   const result = await new Promise<boolean>((resolve, reject) => {
//     crypto.pbkdf2(
//       password,
//       Buffer.from(salt,"hex"),
//       310000,
//       32,
//       "sha256",
//       (err: Error | null, hashedPassword: Buffer) => {
//         if (err) reject(err);
//         if (!crypto.timingSafeEqual(
//           Buffer.from(storedHashedPassword,"hex"),
//           hashedPassword
//         )) {
//           return false;
//         }
//         return true;
//       }
//     );
//   });
const result = compareSync(password,storedHashedPassword);
  return result;
}
