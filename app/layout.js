import './globals.css'
import Tracker from '../components/Tracker'

export const metadata = {
  title: 'Sousa Montagens - Montador de Móveis Premium | Assis e Tarumã',
  description: 'Montador de móveis em Assis e região - Sem pagamento antecipado',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Tracker />
        {children}
      </body>
    </html>
  )
}
