/* tiny facade around the AudioManager */
import { destroy, pause } from "./audioManager";

/** pause *and* fully clean up (used on route changes) */
export function pauseAllAudio() {
  pause();
  destroy();
}
