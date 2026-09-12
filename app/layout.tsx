import Tracker from '@/components/Tracker'
import "./globals.css";
export const metadata = {
  title: "Sousa Montagens - Montador de Móveis Premium | Assis e Tarumã",
  description: "Baixe o app e ganhe 10% OFF em qualquer serviço. Montagem profissional em Assis, Tarumã e região. Orçamento rápido via WhatsApp.",
  manifest: "/manifest.json",
  themeColor: "#d4af37",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sousa Montagens"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes"
  }
};

export const viewport = {
  themeColor: "#d4af37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4af37" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" href="/icons/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
