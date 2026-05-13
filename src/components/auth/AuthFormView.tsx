import AuthError from './AuthError'
import AuthField from './AuthField'
import AuthModeToggle from './AuthModeToggle'
import AuthSubmitButton from './AuthSubmitButton'

type AuthFormViewProps = {
  email: string
  password: string
  isRegister: boolean
  isLoading: boolean
  error: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  onToggleMode: () => void
}

export default function AuthFormView({
  email,
  password,
  isRegister,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}: AuthFormViewProps) {
  return (
    <div className="auth-card">
      <h2 className="auth-card__title">{isRegister ? 'Criar conta' : 'Entrar'}</h2>

      <AuthError error={error} />

      <AuthField
        id="email"
        label="Email"
        type="email"
        value={email}
        placeholder="seu@email.com"
        onChange={onEmailChange}
      />

      <AuthField
        id="password"
        label="Senha"
        type="password"
        value={password}
        placeholder="••••••••"
        onChange={onPasswordChange}
        onEnter={onSubmit}
      />

      <AuthSubmitButton
        isRegister={isRegister}
        isLoading={isLoading}
        disabled={isLoading || !email || !password}
        onSubmit={onSubmit}
      />

      <AuthModeToggle isRegister={isRegister} onToggleMode={onToggleMode} />
    </div>
  )
}
