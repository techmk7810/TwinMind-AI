"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const registerSchema = z.object({
  full_name: z.string().min(2, "Enter your full name").max(120),
  organization_name: z.string().min(2, "Enter an organization name").max(160),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    try {
      await registerAccount(values);
    } catch (submitError) {
      if (axios.isAxiosError(submitError)) {
        setError(submitError.response?.data?.detail ?? "Registration failed");
        return;
      }

      setError("Registration failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            TwinMind AI
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">
            Create account
          </h1>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="full_name"
            >
              Full name
            </label>
            <input
              id="full_name"
              autoComplete="name"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              {...register("full_name")}
            />
            {errors.full_name ? (
              <p className="text-sm text-red-700">{errors.full_name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="organization_name"
            >
              Organization
            </label>
            <input
              id="organization_name"
              autoComplete="organization"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              {...register("organization_name")}
            />
            {errors.organization_name ? (
              <p className="text-sm text-red-700">
                {errors.organization_name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-red-700">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-red-700">{errors.password.message}</p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-medium text-teal-700" href="/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
