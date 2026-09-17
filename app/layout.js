import './globals.css'
import Tracker from '../components/Tracker'
export const metadata = { title: 'Sousa Montagens - Montador de Móveis Premium', description: 'Montador em Assis' }
export default function RootLayout({ children }) {
  return (<html lang="pt-BR"><body><Tracker />{children}</body></html>)
}
