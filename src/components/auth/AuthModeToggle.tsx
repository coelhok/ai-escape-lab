type AuthModeToggleProps = {
  isRegister: boolean
  onToggleMode: () => void
}

export default function AuthModeToggle({ isRegister, onToggleMode }: AuthModeToggleProps) {
  return (
    <p className="auth-mode-toggle">
      {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
      <button type="button" onClick={onToggleMode} className="auth-mode-toggle__button">
        {isRegister ? 'Entrar' : 'Criar conta'}
      </button>
    </p>
  )
}
