import './globals.css'

export const metadata = {
  title: 'SORMS',
  description: 'SORMS Web App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
