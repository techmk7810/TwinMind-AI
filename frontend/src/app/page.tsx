import { Activity, Database, Server } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const foundationItems = [
  { label: "Next.js 15", icon: Activity },
  { label: "FastAPI", icon: Server },
  { label: "PostgreSQL", icon: Database },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            Foundation setup
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
            TwinMind AI
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Enterprise decision intelligence platform foundation for future
            digital twin, forecasting, simulation, and multi-agent AI modules.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {foundationItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <item.icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <p className="mt-4 text-sm font-medium text-slate-900">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
