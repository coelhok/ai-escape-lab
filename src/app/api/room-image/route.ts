import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SCENE_PROMPTS: Record<string, string> = {
  lab_locked:
    "cinematic abandoned underground laboratory, locked metal door with numeric keypad, red emergency lights, broken science equipment, dark atmosphere, escape room, realistic",
  lab_unlocked:
    "cinematic abandoned underground laboratory, metal door unlocked and slightly open, green keypad light, corridor visible beyond the door, dark atmosphere, escape room, realistic",
  corridor_dark:
    "dark narrow underground corridor, emergency lights flickering, metal doors, industrial walls, tense escape room atmosphere, realistic",
  server_room_reactor_active:
    "dark server room, red warning lights, unstable reactor terminal, server racks blinking, emergency alarm, cinematic realistic escape room",
  server_room_reactor_disabled:
    "server room after reactor shutdown, green lights, stable terminal screen, server racks calm, emergency alert disabled, cinematic realistic",
  exit_open:
    "emergency exit door open, green safety lights, underground facility escape route, cinematic realistic atmosphere",
};

const FALLBACK_IMAGES: Record<string, string> = {
  lab_locked:
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=512&h=384&fit=crop",
  lab_unlocked:
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=512&h=384&fit=crop",
  corridor_dark:
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=512&h=384&fit=crop",
  server_room_reactor_active:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=512&h=384&fit=crop",
  server_room_reactor_disabled:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=512&h=384&fit=crop",
  exit_open:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=512&h=384&fit=crop",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateImage(scene: string): Promise<Buffer | null> {
  const prompt = encodeURIComponent(SCENE_PROMPTS[scene] || SCENE_PROMPTS.lab_locked);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=384&seed=${scene}&nologo=true`;

      const response = await fetch(imageUrl, {
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength > 1000) {
          return Buffer.from(arrayBuffer);
        }
      }

      await sleep(1500);
    } catch {
      await sleep(1500);
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const sceneParam = searchParams.get("scene");
  const roomParam = searchParams.get("room");

  const scene =
    sceneParam && SCENE_PROMPTS[sceneParam]
      ? sceneParam
      : roomParam === "lab"
      ? "lab_locked"
      : roomParam === "corridor"
      ? "corridor_dark"
      : roomParam === "server_room"
      ? "server_room_reactor_active"
      : roomParam === "exit"
      ? "exit_open"
      : "lab_locked";

  const filePath = `${scene}.png`;

  try {
    const { data } = supabase.storage
      .from("room-images")
      .getPublicUrl(filePath);

    const cacheCheck = await fetch(data.publicUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    });

    if (cacheCheck.ok) {
      return NextResponse.json({
        scene,
        url: data.publicUrl,
        cached: true,
      });
    }
  } catch {
    // Se não tiver cache, gera imagem.
  }

  const imageBuffer = await generateImage(scene);

  if (imageBuffer) {
    try {
      const { error } = await supabase.storage
        .from("room-images")
        .upload(filePath, imageBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (!error) {
        const { data } = supabase.storage
          .from("room-images")
          .getPublicUrl(filePath);

        return NextResponse.json({
          scene,
          url: data.publicUrl,
          cached: false,
        });
      }
    } catch {
      // Cai no fallback.
    }
  }

  return NextResponse.json({
    scene,
    url: FALLBACK_IMAGES[scene] || FALLBACK_IMAGES.lab_locked,
    cached: false,
    fallback: true,
  });
}