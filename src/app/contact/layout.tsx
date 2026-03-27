import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support — SLS Estimator",
  description:
    "Get in touch for custom quotes, technical support, or material questions. Your job data is auto-attached for faster quoting.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
