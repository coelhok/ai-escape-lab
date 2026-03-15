import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔐 AI Escape Lab
          </h1>
          <p className="text-gray-400">
            Resolva puzzles com a ajuda de agentes de IA
          </p>
        </div>

        <AuthForm />

      </div>
    </div>
  )
}
