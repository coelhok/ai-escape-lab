type AuthFieldProps = {
  id: string
  label: string
  type: 'email' | 'password' | 'text'
  value: string
  placeholder: string
  onChange: (value: string) => void
  onEnter?: () => void
}

export default function AuthField({
  id,
  label,
  type,
  value,
  placeholder,
  onChange,
  onEnter,
}: AuthFieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field__label">
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        className="auth-field__input"
      />
    </div>
  )
}
