type AuthErrorProps = {
  error: string
}

export default function AuthError({ error }: AuthErrorProps) {
  if (!error) return null

  return <div className="auth-error">{error}</div>
}
