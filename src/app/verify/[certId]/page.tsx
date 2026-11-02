import Link from "next/link";
import { getDataStore } from "@/core/data/store";
import { Card } from "@/components/ui/Card";
import { Certificate } from "@/components/certificate/Certificate";
import { formatIssuedDate } from "@/components/certificate/format";

/** Public (no sign-in) certificate check: anyone handed a certificate -- a teacher, an employer --
 * can enter its serial here and see who it was really issued to. Lives outside the (app) group so
 * it isn't behind the login redirect. */
export default async function VerifyCertificatePage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const store = getDataStore();
  const certificate = await store.getCertificate(decodeURIComponent(certId).trim().toUpperCase());
  const moduleMeta = certificate ? await store.getModule(certificate.moduleId) : null;

  if (!certificate || !moduleMeta) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-5xl">❌</p>
        <div>
          <h1 className="text-xl font-bold text-text">Certificate not found</h1>
          <p className="mt-1 max-w-md text-sm text-text-muted">
            No certificate with number <span className="font-mono-tabular font-semibold text-text">{certId}</span> was
            issued. Check the number printed in the bottom-right corner of the certificate. If it still doesn&apos;t
            match, the certificate isn&apos;t genuine.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 py-10">
      <Card className="p-5 text-center border-success/40 space-y-2">
        <p className="text-4xl">✅</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-success">Verified certificate</p>
        <h1 className="font-display text-2xl font-bold text-text">{certificate.recipientName}</h1>
        <p className="text-sm text-text-muted">
          completed <span className="font-semibold text-text">UC {moduleMeta.order} – {moduleMeta.title}</span>
          <br />
          Computer System Servicing (CSS) NC II
        </p>
        <dl className="mx-auto grid max-w-md grid-cols-2 gap-2 pt-2 text-left text-xs">
          <div className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2">
            <dt className="text-text-faint">Certificate No.</dt>
            <dd className="font-mono-tabular font-semibold text-text break-all">{certificate.id}</dd>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2">
            <dt className="text-text-faint">Issued</dt>
            <dd className="font-semibold text-text">{formatIssuedDate(certificate.issuedAt)}</dd>
          </div>
        </dl>
      </Card>
      <div className="flex justify-center">
        <Certificate
          moduleOrder={moduleMeta.order}
          moduleTitle={moduleMeta.title}
          recipientName={certificate.recipientName}
          certificateId={certificate.id}
          issuedAt={certificate.issuedAt}
        />
      </div>
    </div>
  );
}
