"use client";

import { DashboardContent } from "./dashboard-content";
import { Providers } from "../providers";

export function ClientWrapper() {
  return (
    <Providers>
      <DashboardContent />
    </Providers>
  );
} 