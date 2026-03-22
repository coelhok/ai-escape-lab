import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { superbase } from '@/lib/superbase/client'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function login(email: string, password: string) {
    setIsLoading(true)
    setError('')

    const { error: authError } = await superbase.auth.signInWithPassword({ email, password })

    console.log('authError:', authError)
    console.log('Login ok, redirecionando...')

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.')
      } else {
        setError('Erro ao entrar. Tente novamente.')
      }
    } else {
      console.log('Chamando router.push /game')
      router.push('/game')
      console.log('router.push chamado!')
    }

    setIsLoading(false)
  }

  async function register(email: string, password: string) {
    setIsLoading(true)
    setError('')

    const { error: authError } = await superbase.auth.signUp({ email, password })

    if (authError) {
      if (authError.message.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login!')
      } else if (authError.message.includes('Password')) {
        setError('Senha fraca. Use pelo menos 6 caracteres.')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } else {
      router.push('/game')
    }

    setIsLoading(false)
  }

  return { login, register, isLoading, error, setError }
}