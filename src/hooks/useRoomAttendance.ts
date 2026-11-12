import { useEffect, useState } from 'react';

interface RoomAttendance {
  participants: { id: string; studentName: string; className: string }[];
  completedCount: number | null;
}

export function useRoomAttendance(roomCode?: string) {
  const [snapshot, setSnapshot] = useState<{ code: string; data: RoomAttendance | null }>();
  useEffect(() => {
    if (!roomCode || !/^\d{6}$/.test(roomCode)) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const response = await fetch(`/api/rooms/${roomCode}/participants`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const { participants, completedCount } = await response.json();
        if (!controller.signal.aborted) {
          setSnapshot({ code: roomCode!, data: { participants, completedCount: completedCount ?? null } });
        }
      } catch {
        if (!controller.signal.aborted) setSnapshot({ code: roomCode!, data: null });
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 3000);
      }
    }
    void refresh();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [roomCode]);
  return snapshot && snapshot.code === roomCode ? snapshot.data : undefined;
}
