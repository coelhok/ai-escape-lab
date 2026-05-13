type AuthSubmitButtonProps = {
  isRegister: boolean
  isLoading: boolean
  disabled: boolean
  onSubmit: () => void
}

export default function AuthSubmitButton({
  isRegister,
  isLoading,
  disabled,
  onSubmit,
}: AuthSubmitButtonProps) {
  return (
    <button type="button" onClick={onSubmit} disabled={disabled} className="auth-submit-button">
      {isLoading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
    </button>
  )
}
