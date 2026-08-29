import Image from "next/image";

/** The app's logo mark -- a badge illustrating the CSS NC II toolset
 * (case, monitor, motherboard, RAM, HDD, screwdriver, wrench). Rendered
 * from /public/logo.png (see src/app/icon.png, which mirrors it for the
 * browser tab / favicon). */
export function Logomark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={256}
      height={256}
      className={`${className} object-contain shrink-0`}
      priority
    />
  );
}
