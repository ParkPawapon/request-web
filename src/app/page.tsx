const foundationChecks = [
  "Next.js App Router",
  "TypeScript strict mode",
  "Bun package manager",
  "Enterprise layer boundaries",
] as const;

export default function Home() {
  return (
    <main className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-8 lg:px-12">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold">Request Web</h1>
          <p className="mt-2 text-base text-gray-600">
            Production frontend foundation for the request platform.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold">Migration-ready shell</h2>
          <ul className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
            {foundationChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
