import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SLS Material Finder — SLS Estimator",
  description:
    "Enter your mechanical requirements and find the best SLS powder match. Compare tensile strength, elongation, HDT, and more across all available materials.",
};

export default function MaterialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
