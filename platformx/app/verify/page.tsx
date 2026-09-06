import CertificateVerificationPage from "./[code]/page";

export default function VerifyIndexPage() {
  return <CertificateVerificationPage params={Promise.resolve({ code: "MP-CERT-2026-AW01" })} />;
}
