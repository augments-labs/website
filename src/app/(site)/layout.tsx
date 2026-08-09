import Link from "next/link";

function Logo() {
  return (
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcSet="/augments-labs-logo-light.svg"
      />
      <img
        src="/augments-labs-logo-dark.svg"
        alt="Augments Labs"
        className="h-7 w-auto"
      />
    </picture>
  );
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="Augments Labs home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link
              href="/docs"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Docs
            </Link>
            <a
              href="https://github.com/augments-labs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-6 text-sm text-zinc-500">
          <strong>Build the augment. Keep the human in command.</strong>
          <Link href="/device-preview" className="hover:underline">
            Device preview
          </Link>
        </div>
      </footer>
    </>
  );
}
