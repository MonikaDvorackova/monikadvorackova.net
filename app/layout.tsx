import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark transition-colors duration-500">
        {children}
      </body>
    </html>
  );
}
