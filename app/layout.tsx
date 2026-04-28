import "./globals.css";

export const metadata = {
  title: "AI 调度中心",
  description: "NextJs AI App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
