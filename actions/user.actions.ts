"use server";

import { db } from "@/server/db/index";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../utils/auth";
import { RegisterSchema, RegisterSchemaType } from "../validation/sign-up";
import { signIn, signOut } from "@/server/auth";
import { SigninSchema, SigninType } from "../validation/sign-in";

export async function getUsersFromDb(email: string, enteredPassword: string) {
  try {
    console.log("here")
    const existedUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existedUser) {
      return {
        success: false,
        messsage: "user not found",
      };
    }

    const { salt, password } = existedUser;
    const isPasswordCorrect = await comparePassword(
      enteredPassword,
      password,
      salt
    );

    if (!isPasswordCorrect) {
      return {
        success: false,
        message: "wrong password",
      };
    }

    return {
      success: true,
      data: existedUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}


export async function login(values: SigninType | RegisterSchemaType) {
  try {
    
    // Determine which schema to use based on the shape of the values object
    const isSignIn = 'email' in values && 'password' in values && Object.keys(values).length === 2;
    
    // Parse values using the appropriate schema
    const validatedData = isSignIn 
      ? SigninSchema.parse(values)
      : RegisterSchema.parse(values);

    const { email, password } = validatedData;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return {
      success: true,
      message: "signin successful",
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Email or password is incorrect.",
      data: null,
    };
  }
}

export async function register(values: RegisterSchemaType) {
  try {

    const { email, password } = RegisterSchema.parse(
      values,
    );
    // get user from db
    const existedUser = await getUsersFromDb(email, password);
    if (existedUser.success) {
      return {
        success: false,
        message: "User already exists.",
      };
    }
    const { hashedPassword, salt } = await hashPassword(password);

    const [insertedUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        salt,
      })
      .returning({
        id: users.id,
        email: users.email,
      });
      console.log("then here");
    return {
      success: true,
      message : "user created",
      data: insertedUser,
    };
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: "something went wrong",
      data : error,
    };
  }
}

export async function logout() {
  try {
    await signOut({
      redirect: false,
    });
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}
