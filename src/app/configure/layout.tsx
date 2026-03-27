import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configure Your Print Job — SLS Estimator",
  description:
    "Upload a 3D file or enter dimensions manually to get an instant SLS print cost and time estimate for the Formlabs Fuse 1+.",
};

export default function ConfigureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
