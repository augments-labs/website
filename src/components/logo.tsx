/**
 * The Augments Labs wordmark, swapped by theme class (next-themes), not by
 * OS media query — so it follows the header toggle. The dark file is for
 * light backgrounds, the light file for dark backgrounds.
 */
/* eslint-disable @next/next/no-img-element -- static SVG logo pair switched via CSS classes */
export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <>
      <img
        src="/augments-labs-logo-dark.svg"
        alt="Augments Labs"
        className={`${className} w-auto dark:hidden`}
      />
      <img
        src="/augments-labs-logo-light.svg"
        alt="Augments Labs"
        className={`hidden ${className} w-auto dark:block`}
      />
    </>
  );
}
