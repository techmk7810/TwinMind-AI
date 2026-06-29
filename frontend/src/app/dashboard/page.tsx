"use client";

import { LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const primaryOrganization = user?.organizations[0];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
                TwinMind AI
              </p>
              <h1 className="text-xl font-semibold text-slate-950">Dashboard</h1>
            </div>
            <Button type="button" variant="outline" onClick={() => void logout()}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Log out
            </Button>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <p className="text-sm text-slate-600">Signed in as</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {user?.full_name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Organization</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              {primaryOrganization?.name ?? "No organization"}
            </h2>
            <p className="mt-1 text-sm capitalize text-slate-600">
              {primaryOrganization?.role ?? "member"}
            </p>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
