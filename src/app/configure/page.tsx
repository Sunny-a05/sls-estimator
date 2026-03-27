"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ConfiguratorShell } from "@/components/configurator/ConfiguratorShell";

export default function ConfigurePage() {
  return (
    <>
      <Navbar />
      <ConfiguratorShell />
    </>
  );
}
