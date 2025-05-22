import { useEffect, useState, useRef } from "react";

import { Button, Stack, IconButton, Slider, Tooltip } from "@mui/material";

import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export interface AudioToggleButtonProps {
  src: string;
}

// sessionStorage keys, audio settings reset after closing browser
const VOLUME_KEY = "vfe-audio-volume";
const MUTE_KEY = "vfe-audio-muted";

function AudioToggleButton({ src }: AudioToggleButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Mute statea, initialized from sessionStorage 
  const [isMuted, setIsMuted] = useState(() => {
    return sessionStorage.getItem(MUTE_KEY) === "true";
  });
  // Audio volume (from 0.0-1.0), initialized from sessionStorage
  const [volume, setVolume] = useState(() => {
    const stored = sessionStorage.getItem(VOLUME_KEY);
    return stored ? parseFloat(stored) : 0.5;
  });

  /* Set up the audio element when component mounts or src changes. 
   * Loops the audio and applies the current volume and mute states. 
   * Clean up by pausing audio and clearning audioRef. 
   */
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  // Handle Play Audio button clicks
  const handlePlay = async () => {
    try {
      await audioRef.current?.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn("Playback failed:", error);
    }
  };

  // Handle Pause Audio button clicks 
  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  // Toggles the mute state and updates sessionStorage and audio element
  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    sessionStorage.setItem(MUTE_KEY, String(newMuted));
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  /* Updates volume state and reflects change in audio element. 
   * Handles auto muting when volume is 0.0
   */
  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const newVolume = typeof value === "number" ? value : value[0];
    setVolume(newVolume);
    sessionStorage.setItem(VOLUME_KEY, newVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  // UI rendering, shows play button by default, show pause & slider if playing 
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {!isPlaying ? (
        <Button
          variant="outlined"
          size="small"
          onClick={handlePlay}
          startIcon={<PlayArrowIcon />}
        >
          Play Audio
        </Button>
      ) : (
        <>
          <Tooltip title={isMuted ? "Unmute" : "Mute"}>
            <IconButton onClick={handleMuteToggle} size="small">
              {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
          </Tooltip>

          <Slider
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            sx={{ width: 100 }}
          />

          <Tooltip title="Pause Audio">
            <IconButton onClick={handlePause} size="small">
              <PauseIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );
}

export default AudioToggleButton;
