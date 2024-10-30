"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SigninSchema, SigninType } from "../../../../validation/sign-in";
import { useState, useTransition } from "react";
import LoadingButton from "@/components/loading-button";
import { login } from "../../../../actions/user.actions";
import { useRouter } from "next/router";

export default function SignInForm() {
  const router = useRouter();
  const form = useForm<SigninType>({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  async function onSubmit(values: SigninType) {
    setError(undefined);
    startTransition(async () => {
      try {
        const res = await login(values);
        if (res.success) {
          router.push("/");
        }
        setError(res.message);
        return;
      } catch (error) {
        setError("something went wrong please try again");
        return;
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {error && <p className="text-center text-destructive">{error}</p>}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Sign In
        </LoadingButton>
      </form>
    </Form>
  );
}
