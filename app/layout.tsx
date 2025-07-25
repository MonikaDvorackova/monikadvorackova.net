import "./globals.css";

export const metadata = {
  title: "Monika Dvořáčková",
  description: "AI engineer and legal tech consultant",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark transition-colors duration-500">
        {children}
      </body>
    </html>
  );
}
