import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

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
        className="h-9 w-auto"
      />
    </picture>
  );
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header
        data-pagefind-ignore
        className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" aria-label="Augments Labs home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted">
            <Link href="/#projects" className="hover:text-foreground">
              Projects
            </Link>
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <a
              href="https://github.com/augments-labs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main data-pagefind-body className="flex-1">
        {children}
      </main>
      <footer data-pagefind-ignore className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-6 text-sm text-muted">
          <strong>Build the augment. Keep the human in command.</strong>
          <Link href="/device-preview" className="hover:underline">
            Device preview
          </Link>
        </div>
      </footer>
    </>
  );
}
