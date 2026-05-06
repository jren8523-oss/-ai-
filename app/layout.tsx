import type { ReactNode } from "react";
import "./globals.css";
import { RootProviders } from "./providers";

export const metadata = {
  title: "AI 调度中心",
  description: "NextJs AI App",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning className="flex justify-center bg-[#E2E8F0]">
        <div className="w-full max-w-[375px] mx-auto min-h-screen bg-[#F6F7F9] shadow-2xl border-x border-[#D1D5DB] relative overflow-hidden">
          <RootProviders>{children}</RootProviders>
        </div>
      </body>
    </html>
  );
}