import type { ReactNode } from "react";
import "./globals.css";

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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
