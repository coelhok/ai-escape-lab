 
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/useAuth'

export default function AuthForm() {
  const { login, register, isLoading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  function handleSubmit() {
    if (isRegister) {
      register(email, password)
    } else {
      login(email, password)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-white mb-6">
        {isRegister ? 'Criar conta' : 'Entrar'}
      </h2>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-400 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !email || !password}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg py-3 transition-colors"
      >
        {isLoading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
      </button>

      <p className="text-center text-gray-500 text-sm mt-4">
        {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
        <button
          onClick={() => { setIsRegister(!isRegister); setError('') }}
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          {isRegister ? 'Entrar' : 'Criar conta'}
        </button>
      </p>
    </div>
  )
}