import "server-only";
import { randomInt } from "node:crypto";
import type { CertificateRecord, DataStore, ModuleMeta } from "@/core/data/types";

/** Crockford-style alphabet: no I/L/O/U, so a serial read off a printout can't be mistyped as a
 * different one. */
const SERIAL_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** e.g. "CSS-UC1-7K3M-Q9XA-2PDT". 12 random characters from crypto.randomInt is 60 bits -- far
 * too many to guess a valid serial, which is what makes the public verify page trustworthy. */
export function generateCertificateId(moduleOrder: number): string {
  const groups = Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => SERIAL_ALPHABET[randomInt(SERIAL_ALPHABET.length)]).join(""),
  );
  return `CSS-UC${moduleOrder}-${groups.join("-")}`;
}

/** Returns this user's certificate for the module, issuing it on the first call. Only call once
 * the module is actually complete. */
export function getOrIssueCertificate(
  store: DataStore,
  uid: string,
  moduleMeta: ModuleMeta,
  recipientName: string,
): Promise<CertificateRecord> {
  return store.issueCertificate({
    id: generateCertificateId(moduleMeta.order),
    uid,
    moduleId: moduleMeta.id,
    recipientName,
    issuedAt: Date.now(),
  });
}
