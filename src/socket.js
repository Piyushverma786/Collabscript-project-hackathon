// import {io} from 'socket.io-client'


// export const initSocket = async () => {
//     const options = {
//         'force new connection' : true,
//         reconnectionAttempt : 'Infinity',
//         timeout : 10000,
//         transports : ['websocket'],
//     }

//     return io(process.env.REACT_APP_BACKEND_URL, options)
// }


// import { io } from "socket.io-client";

// export const initSocket = async () => {
//   const options = {
//     forceNew: true,
//     reconnectionAttempts: Infinity,
//     timeout: 10000,
//     transports: ["websocket"],
//   };

//   const URL =
//     process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

//   return io("https://collabscript-socket.onrender.com", options);
// };
import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"],
  };

  const URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://collabscript-socket.onrender.com";

  return io(URL, options);
};