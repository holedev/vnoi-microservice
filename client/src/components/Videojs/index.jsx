// import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";
// import "@videojs/http-streaming";
// import "videojs-contrib-quality-levels";
// import "videojs-hls-quality-selector";

// const VideoPlayer = forwardRef(({ src, onTimeUpdate, onLoadedMetadata }, ref) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);

//   useImperativeHandle(ref, () => ({
//     get player() {
//       return playerRef.current;
//     },
//     get videoElement() {
//       return videoRef.current;
//     }
//   }));

//   useEffect(() => {
//     if (videoRef.current && !playerRef.current) {
//       playerRef.current = videojs(videoRef.current, {
//         controls: true,
//         autoplay: false,
//         preload: "auto",
//         fluid: true,
//         sources: [{ src, type: "application/x-mpegURL" }]
//       });

//       playerRef.current.ready(() => {
//         let qualityLevels = playerRef.current.qualityLevels();
//         qualityLevels.selectedIndex_ = 0;
//         qualityLevels.trigger({ type: "change", selectedIndex: 0 });

//         qualityLevels.on("addqualitylevel", function (event) {
//           const qualityLevel = event.qualityLevel;

//           if (qualityLevel.height >= 720) {
//             qualityLevel.enabled = true;
//           } else {
//             qualityLevel.enabled = false;
//           }
//         });
//       });

//       playerRef.current.on("error", () => {
//         console.log("Error occurred:", playerRef.current.error());
//       });
//     }

//     return () => {
//       if (playerRef.current) {
//         playerRef.current.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [src]);

//   return (
//     // eslint-disable-next-line jsx-a11y/media-has-caption
//     <video
//       onLoadedMetadata={onLoadedMetadata}
//       onTimeUpdate={onTimeUpdate}
//       style={{ minWidth: 500, flex: 1 }}
//       ref={videoRef}
//       className='video-js'
//     />
//   );
// });

// export default VideoPlayer;
