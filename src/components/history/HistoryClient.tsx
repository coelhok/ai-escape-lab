'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Session } from '@/types/game'
import HistoryLayout from './HistoryLayout'

export default function HistoryClient() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('updated_at', { ascending: false })

      if (!error && data) {
        setSessions(data)
      }

      setIsLoading(false)
    }

    loadSessions()
  }, [])

  return (
    <HistoryLayout
      sessions={sessions}
      isLoading={isLoading}
      onBackToGame={() => router.push('/game')}
      onOpenSession={(sessionId) => router.push(`/game?session=${sessionId}`)}
    />
  )
}
