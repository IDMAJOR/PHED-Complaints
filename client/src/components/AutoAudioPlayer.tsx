import { useEffect, useRef, useState } from "react";

interface AutoAudioPlayerProps {
  src: string;
  loop?: boolean;
  muted?: boolean;
  onEnded?: () => void;
  autoPlay?: boolean;
}

function AutoAudioPlayer({
  src,
  loop = false,
  muted = false,
  onEnded,
  autoPlay = true,
}: AutoAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      onEnded?.();
    };

    audio.addEventListener("ended", handleEnded);

    if (userInteracted && autoPlay) {
      audio.play().catch((err) => {
        console.log("Playback failed:", err);
      });
    }

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [userInteracted, autoPlay, onEnded]);

  return <audio ref={audioRef} src={src} loop={loop} muted={muted} />;
}

export default AutoAudioPlayer;
