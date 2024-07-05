import { useEffect } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlyrLayout, plyrLayoutIcons } from "@vidstack/react/player/layouts/plyr";

const VideoStack = ({ videoRef, src, onTimeUpdate, onLoadedMetadata }) => {
  useEffect(() => {
    const player = videoRef.current;

    const handleHlsError = (event) => {
      const error = event.detail;
      console.error("HLS Error:", error);
      if (error.type === "networkError" || error.type === "bufferStalledError") {
        // Xử lý lỗi mạng hoặc lỗi buffer bị tắc
        console.log("Network or buffer stalled error occurred");
      }
    };

    player.addEventListener("hls-error", handleHlsError);

    return () => {
      player.removeEventListener("hls-error", handleHlsError);
    };
  }, [videoRef]);

  return (
    <MediaPlayer ref={videoRef} title='Video' src={src} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata}>
      <MediaProvider />
      <PlyrLayout icons={plyrLayoutIcons} />
    </MediaPlayer>
  );
};

export default VideoStack;
