"use client";

import { useEffect, useState } from "react";
import { INITIAL_ROOM, ROOMS } from "@/constants/rooms";
import type { Room } from "@/types/game";
import InventoryPanel from "./scene/InventoryPanel";
import RoomDescription from "./scene/RoomDescription";
import RoomMap from "./scene/RoomMap";
import SceneImage from "./scene/SceneImage";

type ScenePanelProps = {
  currentRoom: Room
  inventory: string[]
  sceneState: string
};

export default function ScenePanel({
  currentRoom,
  inventory,
  sceneState,
}: ScenePanelProps) {
  const room = ROOMS[currentRoom] || ROOMS[INITIAL_ROOM];

  const [imageState, setImageState] = useState<{
    scene: string | null;
    url: string;
    loaded: boolean;
    failed: boolean;
  }>({
    scene: null,
    url: "",
    loaded: false,
    failed: false,
  });

  const imageUrl = imageState.scene === sceneState ? imageState.url : "";
  const imageLoading =
    imageState.scene !== sceneState ||
    (!imageState.loaded && !imageState.failed);

  useEffect(() => {
    let ignore = false;

    fetch(`/api/room-image?scene=${sceneState}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setImageState({
          scene: sceneState,
          url: data.url || "",
          loaded: false,
          failed: !data.url,
        });
      })
      .catch(() => {
        if (ignore) return;

        setImageState({
          scene: sceneState,
          url: "",
          loaded: false,
          failed: true,
        });
      });

    return () => {
      ignore = true;
    };
  }, [sceneState]);

  return (
    <div className="scene-panel">
      <SceneImage
        imageUrl={imageUrl}
        imageLoading={imageLoading}
        alt={`${room.name} - ${sceneState}`}
        onLoad={() =>
          setImageState((state) =>
            state.scene === sceneState ? { ...state, loaded: true } : state
          )
        }
        onError={() =>
          setImageState((state) =>
            state.scene === sceneState ? { ...state, failed: true } : state
          )
        }
      />

      <RoomDescription room={room} />
      <RoomMap currentRoom={currentRoom} />
      <InventoryPanel inventory={inventory} />
    </div>
  );
}