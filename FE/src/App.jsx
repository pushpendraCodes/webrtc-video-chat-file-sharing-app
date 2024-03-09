import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  Text,
  Button,
  Image,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  VStack,
} from "@chakra-ui/react";
import { ArrowForwardIcon, CopyIcon, PhoneIcon } from "@chakra-ui/icons";
import "./style.css";
import { SocketContext } from "./SocketProvider";
import ChatDrawer from "./component/ChatDrawer";

function App() {
  const {
    myStream,
    me,
    setme,
    setRemoteSocket,
    remoteSocket,
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
    // connectionRef,
    peer,
    callUser,
    leaveCall,
    toggleAudioMute,
    toggleVideoMute,
    connectToPeer,
    startScreenShare,
    stopScreenShare,
    socket,
    setuserName,
  } = useContext(SocketContext);

  // current time
  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  console.log(IsscreenStream, "IsscreenStream");
  console.log(screenvideo, "screenvideo");
  console.log(myVideo, "myVideo");
  return (
    <>
      <Box p={5}>
        <Text
          textAlign={"center"}
          my={5}
          fontFamily={"sans-serif"}
          fontSize={"x-large"}>
          -WebStream-
        </Text>

        {!IsscreenStream && (
          <HStack mt={10}>
            <Box w={"33%"}>
              <video
                playsInline
                muted={isAudioMuted}
                ref={myVideo}
                autoPlay
                className="videoPlayer1"
              />

              {name}
            </Box>
            <Box w={"33%"}>
              <video
                playsInline
                muted={isAudioMuted}
                ref={userVideo}
                autoPlay
                className="videoPlayer2"
              />

              {user}
            </Box>
            <Box
              bg={"#f6f3f3eb"}
              w={"30%"}
              fontFamily={"sans-serif"}
              color={""}
              px={5}
              borderRadius={15}
              py={10}>
              <Text my={3}>Connect to someone</Text>
              <FormControl>
                <Input
                  onChange={(e) => setName(e.target.value)}
                  border={"1px solid teal"}
                  w={"80%"}
                  placeholder="Name"
                />
              </FormControl>

              <Popover>
                <PopoverTrigger>
                  <CopyToClipboard text={me}>
                    <Button
                      w={"80%"}
                      my={4}
                      rightIcon={<CopyIcon />}
                      colorScheme="teal"
                      variant="outline">
                      Copy ID
                    </Button>
                  </CopyToClipboard>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader color={"green"}>Copied!</PopoverHeader>
                  {/* <PopoverBody>
                    Are you sure you want to have that milkshake?
                  </PopoverBody> */}
                </PopoverContent>
              </Popover>

              <FormControl
                position={"relative"}
                mt={4}>
                <Input
                  onChange={(e) => setRemoteSocket(e.target.value)}
                  w={"80%"}
                  border={"1px solid teal"}
                  placeholder="Id To Call"
                />
                <Image
                  cursor={"pointer"}
                  className="call"
                  w={30}
                  h={30}
                  onClick={() => {
                    if (!remoteSocket) return alert("remote id required");
                    if (!name) return alert("name is required");
                    callUser(remotePeerId);
                  }}
                  src="video-camera.png"
                />
              </FormControl>
            </Box>
          </HStack>
        )}
        {

          console.log("myVideo:", myVideo)

        }

        {
          IsscreenStream &&
          <HStack>
          {screenvideo && (
            <Box
              gap={5}
              w={"60%"}>
              <video
                ref={screenvideo}
                autoPlay
                className="screen1"
              />
            </Box>
          )}
          <VStack
            w={"40%"}
            gap={2}>
            {myVideo.current && (
              <Box>
                <video
                  playsInline
                  muted={isAudioMuted}
                  ref={myVideo}
                  autoPlay
                  className="videoPlayer3"
                />
              </Box>
            )}
            {userVideo && (
              <Box>
                <video
                  playsInline
                  muted={isAudioMuted}
                  ref={userVideo}
                  autoPlay
                  className="videoPlayer3"
                />

                {user}
              </Box>
            )}
          </VStack>
        </HStack>
        }


        <HStack
          w={"70%"}
          borderRadius={10}
          py={2}
          mt={10}
          gap={5}
          mx={"auto"}
          justifyContent={"space-between"}>
          <Box>
            <Text as={"b"}>{formattedTime}</Text>
            <Text></Text>
          </Box>
          <Box
            gap={5}
            display={"flex"}>
            <button onClick={toggleAudioMute}>
              {isAudioMuted ? (
                <Image
                  width={8}
                  src="/mute.png"
                />
              ) : (
                <Image
                  width={8}
                  src="/mic.png"
                />
              )}
            </button>
            <button onClick={toggleVideoMute}>
              {isVideoMuted ? (
                <Image
                  width={8}
                  src="/video-mute.png"
                />
              ) : (
                <Image
                  width={8}
                  src="/video.png"
                />
              )}
            </button>
            <button onClick={startScreenShare}>
              <Image
                width={8}
                src="/present.png"
              />
            </button>
            <button onClick={leaveCall}>
              <Image
                width={8}
                src="/circle.png"
              />
            </button>
          </Box>
          <Box>
            <ChatDrawer />
          </Box>
        </HStack>

        {/* {receivingCall && !callAccepted && (
          <Box
            display={"flex"}
            gap={2}
            my={5}
            justifyContent={"center"}>
            <Text
              fontSize={"xl"}
              fontWeight={200}>
              {name} is calling .....
            </Text>
            <Button
              size={"sm"}
              bg={"teal"}
              onClick={ansCall}>
              Answer
            </Button>
          </Box>
        )} */}
        {/*
        <Box>
          {screenvideo && (
            <video
              playsInline
              muted
              ref={screenvideo}
              autoPlay
              className="videoPlayer1"
            />
          )}
        </Box> */}
      </Box>
    </>
  );
}

export default App;
