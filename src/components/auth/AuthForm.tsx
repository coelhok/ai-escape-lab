'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import AuthFormView from './AuthFormView'

export default function AuthForm() {
  const { login, register, isLoading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  async function handleSubmit() {
    if (isRegister) {
      await register(email, password)
      return
    }

    await login(email, password)
  }

  function handleToggleMode() {
    setIsRegister((currentValue) => !currentValue)
    setError('')
  }

  return (
    <AuthFormView
      email={email}
      password={password}
      isRegister={isRegister}
      isLoading={isLoading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onToggleMode={handleToggleMode}
    />
  )
}
