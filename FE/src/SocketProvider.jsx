import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

export const SocketContext = createContext();

const socket = io(import.meta.env.VITE_URL);
console.log(import.meta.env.REACT_VITE_URL,"import.meta.env.REACT_VITE_URL")
export const ContextProvider = ({ children }) => {
  const myVideo = useRef();
  const userVideo = useRef();
  let screenvideo = useRef();

  const [myStream, setMyStream] = useState(null);
  const [me, setme] = useState(null);
  const [remoteSocket, setRemoteSocket] = useState();

  const [myPeerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);

  const [caller, setCaller] = useState();
  const [receivingCall, setRecievingCall] = useState(false);

  const [name, setName] = useState();
  const [user, setuserName] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [IsscreenStream, setIsScreenStream] = useState(false);

  const [file, setFile] = useState();
  // const [Peer, setPeer] = useState(null);
  // chat section
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState();

  const connectionRef = useRef();
  const peer = new Peer();
  const connection = peer.connect(remotePeerId);

  useEffect(() => {
    getLocalStream();
  }, []);

  useEffect(() => {
    peer.on("open", (id) => setPeerId(id));

    // peer.on("connection", (conn) => {
    //   conn.on("data", (data) => {
    //     console.log(data, "datafile");
    //     // Handle incoming data here
    //   });
    // });

    const handleMeEvent = (data) => setme(data);
    socket.on("me", handleMeEvent);
    connectionRef.current = peer;
    return () => {
      socket.off("me", handleMeEvent);
      peer.destroy();
    };
  }, []);



  useEffect(() => {
    if (peer) {
      peer.on('data', (data) => {
        // Check the type of data received
        console.log(data ,"filerecie")
        if (data.type === 'file') {
          const receivedFile = {
            name: data.fileName,
            size: data.fileSize,
            data: [], // Placeholder for the file data chunks
          };

          // Listen for the file data chunks
          connection.on('data', (chunk) => {
            receivedFile.data.push(chunk);

            // Check if the file is fully received
            if (receivedFile.data.length === Math.ceil(receivedFile.size / 16384)) {
              // Combine the file data chunks into a single Blob
              const receivedBlob = new Blob(receivedFile.data);

              // Perform further actions with the received file
              console.log('File received:', receivedBlob);

              // Clear the data array for the next file
              receivedFile.data = [];
            }
          });
        }
      });
    }
  }, [peer]);

  console.log(screenvideo, "screenvideo");
  console.log(userVideo, "userVideo");
  console.log(myVideo, "myVideo");

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log(stream, "stream");
    setMyStream(stream);
    if (myVideo) {
      console.log("jbj");
      myVideo.current.srcObject = stream;
    }
  };

  // calling function
  const callUser = useCallback(() => {
    socket.emit("call-user", {
      userToCall: remoteSocket,
      signalData: { type: "offer", offer: myPeerId },
      from: me,
      name: name,
    });

    socket.off("call-user");
  }, [remoteSocket, myPeerId, me, name]);

  const msgHandler = (data) => {
    console.log(data, "msg");
    const Msg = { msg: data.msg, you: false };
    setMsgs((prev) => [...prev, Msg]);
  };

  useEffect(() => {
    socket.on("msg", msgHandler);
    return () => {
      socket.off("msg", msgHandler);
    };
  }, []);

  // const ansCall = () => {
  //   setCallAccepted(true);
  //   const peer = new Peer({
  //     initiator: false,
  //     trickle: false,
  //     stream: myStream,
  //   });

  //   peer.on("open", (peerId) => {
  //     socket.emit("call-answer", {
  //       signal: { type: "ans", answer: peerId },
  //       to: caller,
  //     });
  //   });

  //   peer.on("call", (call) => {
  //     call.answer(myStream);
  //     call.on("stream", function (remoteStream) {
  //       userVideo.current.srcObject = remoteStream;
  //     });
  //   });

  //   connectionRef.current = peer;
  // };

  const leaveCall = useCallback(() => {
    setCallEnded(true);
    connectionRef.current.destroy();
  }, []);

  const toggleAudioMute = useCallback(() => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled =
        !myStream.getAudioTracks()[0].enabled;
      setIsAudioMuted((prev) => !prev);
    }
  }, [myStream]);

  const toggleVideoMute = useCallback(() => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled =
        !myStream.getVideoTracks()[0].enabled;

      setIsVideoMuted((prev) => !prev);
    }
  }, [myStream]);

  // for screen sharing
  const connectToPeer = useCallback((remotePeerId, stream) => {
    const call = peer.call(remotePeerId, stream, {
      metadata: { type: "screen" },
    });
    call.on("close", () => {
      setRemotePeerId(null);
    });
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      let screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: false,
      });
      setIsScreenStream(true);

      if (screenvideo) {
        console.log("cong");
        screenvideo.current.srcObject = screenStream;
        console.log(screenvideo, "screenvideo3");
      }

      // if (remotePeerId && screenStream) {
      //   connectToPeer(remotePeerId, screenStream);
      // }
    } catch (error) {
      console.error("Error accessing screen share:", error);
    }
  }, [screenvideo, remotePeerId]);

  const stopScreenShare = useCallback(() => {
    screenvideo.current.srcObject = null;
  }, []);

  console.log(screenvideo, "screenvideo1");

  // for send msg

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (event) => {
    const fileUploaded = event.target.files[0];
    console.log(fileUploaded, "fileUploaded");
    setFile(fileUploaded);
  };

  const sendMsg = useCallback(() => {
    console.log(file, "file");
    if (file) {
      console.log(file, "file1");
      const data = {
        type: "file",
        fileName: file.name,
        fileSize: file.size,
      };
console.log(connection,"connect")
      connection.send(data);
      const reader = new FileReader();

      reader.onload = (event) => {
        connection.send(event.target.result);
      };

      reader.readAsArrayBuffer(file);
    }

    const Msg = { msg: msg, you: true };
    setMsgs((prev) => [...prev, Msg]);

    socket.emit("msg", { to: remoteSocket, msg: msg });
    setMsg("");
  }, [msg, file, remoteSocket]);

  // for receieving call
  const handleCallUserEvent = useCallback(
    (data) => {
      console.log(data, "someone is calling");
      setRecievingCall(true);
      setRemotePeerId(data.signal.offer);
      setuserName(data.name);
      setRemoteSocket(data.from);

      console.log(myPeerId, me, "inside");
      socket.emit("call-answer", {
        peerId: myPeerId,
        from: me,
        name: name || "deepak",
        to: data.from,
      });
    },
    [myPeerId, me]
  );

  // for making call
  const handleCallAcceptedEvent = useCallback(
    (data) => {
      console.log("call accepted", data.peerId);
      console.log("connectionRef", peer);

      if (!data.peerId) {
        console.error("Invalid peerId in call-accepted event data:", data);
        return;
      }

      if (!connectionRef.current) {
        console.error("Peer connection is not open.");
        return;
      }

      // Use a promise to wait for the peer connection to be open
      const makeCall = () => {
        return new Promise((resolve, reject) => {
          console.log(data.peerId, myStream, "check");
          const call = peer.call(data.peerId, myStream, {
            metadata: { type: "video" },
          });

          if (!call) {
            console.error("Failed to create a call object.");
            reject(new Error("Failed to create a call object."));
          }

          call.on("stream", (remoteStream) => {
            console.log(remoteStream, "remoteStream");
            userVideo.current.srcObject = remoteStream;
            resolve(call);
          });
        });
      };

      // Use the promise to make the call
      makeCall()
        .then((call) => {
          console.log("Call object successfully created:", call);
        })
        .catch((error) => {
          console.error("Error while making the call:", error);
        });
    },
    [myStream]
  );

  socket.on("call-user", handleCallUserEvent);
  socket.on("call-accepted", handleCallAcceptedEvent);

  useEffect(() => {
    if (!peer) {
      console.error("Peer connection is not open.");
      return;
    }
    const handleCallEvent = (call) => {
      console.log("aa gya hu");
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            console.log(call, "working for screen share 1");
            if (call.metadata && call.metadata.type === "screen") {
              console.log("working for screen share 2");
              screenvideo.current.srcObject = remoteStream;
            } else {
              console.log("working for screen share 3");
              userVideo.current.srcObject = remoteStream;
            }
          });
        })
        .catch((err) => {
          console.log("Failed to get local stream", err);
        });
    };

    peer.on("call", handleCallEvent);

    // Cleanup function
    return () => {
      peer.off("call", handleCallEvent);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        me,
        remoteSocket,
        setRemoteSocket,
        myStream,
        setMyStream,
        myPeerId,
        setPeerId,
        remotePeerId,
        setRemotePeerId,
        caller,
        setCaller,
        receivingCall,
        setRecievingCall,
        name,
        user,
        setuserName,
        setName,
        callAccepted,
        callEnded,
        setCallEnded,
        setCallAccepted,
        isAudioMuted,
        setIsAudioMuted,
        isVideoMuted,
        setIsVideoMuted,
        IsscreenStream,
        setIsScreenStream,
        myVideo,
        userVideo,
        screenvideo,
        connectionRef,
        peer,
        setme,
        callUser,
        leaveCall,
        toggleAudioMute,
        toggleVideoMute,
        connectToPeer,
        startScreenShare,
        stopScreenShare,
        socket,
        setMsg,
        msg,
        msgs,
        sendMsg,

        setFile,
        fileInputRef,
        handleButtonClick,
        handleChange,
        file,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
