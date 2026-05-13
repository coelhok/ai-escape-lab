import type { ReactNode } from 'react'
import LoginHeader from './LoginHeader'

type LoginShellProps = {
  children: ReactNode
}

export default function LoginShell({ children }: LoginShellProps) {
  return (
    <main className="login-page">
      <section className="login-card-wrapper">
        <LoginHeader />
        {children}
      </section>
    </main>
  )
}
