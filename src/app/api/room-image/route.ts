import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const superbase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ROOM_PROMPTS: Record<string, string> = {
  lab: 'dark abandoned science laboratory, broken equipment, dim green lights, escape room, cinematic, photorealistic',
  corridor: 'dark long corridor, numbered doors, flickering lights, escape room, cinematic, photorealistic',
  server_room: 'dark server room, blinking red lights, computer terminal, escape room, cinematic, photorealistic',
  exit: 'reinforced metal door, numeric keypad, emergency lights, escape room, cinematic, photorealistic',
}

// Imagens de fallback caso a Pollinations falhe
const FALLBACK_IMAGES: Record<string, string> = {
  lab: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=512&h=384&fit=crop',
  corridor: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=384&fit=crop',
  server_room: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=512&h=384&fit=crop',
  exit: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=512&h=384&fit=crop',
}

// Espera X milissegundos antes de continuar
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateImage(room: string): Promise<string | null> {
  const prompt = encodeURIComponent(ROOM_PROMPTS[room] || ROOM_PROMPTS.lab)

  // Tenta 3 vezes com delay crescente
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🎨 Tentativa ${attempt} para sala: ${room}`)

      const url = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=384&seed=${Date.now()}&nologo=true`
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })

      if (response.ok) {
        const buffer = await response.arrayBuffer()
        if (buffer.byteLength > 1000) { // garante que não é vazio
          return Buffer.from(buffer).toString('base64')
        }
      }

      console.log(`⚠️ Tentativa ${attempt} falhou (${response.status}), aguardando...`)
      await sleep(attempt * 2000) // 2s, 4s, 6s

    } catch (err) {
      console.log(`⚠️ Tentativa ${attempt} erro:`, err)
      await sleep(attempt * 2000)
    }
  }

  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const room = searchParams.get('room') || 'lab'

  // Passo 1 — Verifica cache no Supabase
  try {
    const { data } = superbase.storage
      .from('room-images')
      .getPublicUrl(`${room}.png`)

    const cacheCheck = await fetch(data.publicUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })

    if (cacheCheck.ok) {
      console.log('⚡ Cache hit:', room)
      return NextResponse.json({ url: data.publicUrl, cached: true })
    }
  } catch {
    // continua para gerar
  }

  // Passo 2 — Tenta gerar na Pollinations
  const base64Image = await generateImage(room)

  if (base64Image) {
    try {
      const buffer = Buffer.from(base64Image, 'base64')

      const { error } = await superbase.storage
        .from('room-images')
        .upload(`${room}.png`, buffer, {
          contentType: 'image/png',
          upsert: true,
        })

      if (!error) {
        const { data } = superbase.storage
          .from('room-images')
          .getPublicUrl(`${room}.png`)

        console.log('✅ Imagem salva:', room)
        return NextResponse.json({ url: data.publicUrl, cached: false })
      }
    } catch (err) {
      console.log('❌ Erro ao salvar no Supabase:', err)
    }
  }

  // Passo 3 — Fallback com imagem do Unsplash
  console.log('🖼️ Usando fallback para:', room)
  return NextResponse.json({ url: FALLBACK_IMAGES[room] || FALLBACK_IMAGES.lab, cached: false })
}