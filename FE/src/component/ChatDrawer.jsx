import { AttachmentIcon, ChatIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Input,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext, useRef, useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import { SocketContext } from "../SocketProvider";
const ChatDrawer = () => {
  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const { msg, setMsg, msgs, sendMsg, user ,peer,setFile,fileInputRef,handleButtonClick,handleChange,file} = useContext(SocketContext);
  console.log(msgs, "msgs");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [placement, setPlacement] = useState("right");



  return (
    <div>
      <ChatIcon
        cursor={"pointer"}
        fontSize={20}
        onClick={onOpen}
      />
      <Drawer
        placement={placement}
        onClose={onClose}
        isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader
            alignItems={"center"}
            display={"flex"}
            justifyContent={"space-between"}
            borderBottomWidth="1px">
            <p>in Call Message</p>
            <CloseIcon
              fontSize={15}
              cursor={"pointer"}
              onClick={onClose}
            />
          </DrawerHeader>
          <DrawerBody>
            <Stack>
              {msgs &&
                msgs.map((item, i) => {
                  return (
                    <Box
                      key={i}
                      bg={"gray.200"}
                      p={3}
                      borderRadius={6}>
                      <HStack alignItems={"center"}>
                        <Text as={"b"}>{item.you ? "you" : user}</Text>
                        <Text
                          fontSize={12}
                          color={"gray"}>
                          {formattedTime}
                        </Text>
                      </HStack>
                      <Text fontSize={14}>{item.msg}</Text>
                    </Box>
                  );
                })}
            </Stack>
          </DrawerBody>
          {file && <Text mx={4} >{file.name}</Text>}
          <DrawerFooter>

            <Input
              value={msg}
              placeholder="send  a message"
              borderRadius={15}
              onChange={(e) => setMsg(e.target.value)}
            />
            <Input
              hidden
              type="file"
        onChange={handleChange}
        accept="image/*, application/pdf"
        ref={fileInputRef}
              borderRadius={15}
              // onChange={(e) => setMsg(e.target.value)}
            />

            <Button
              onClick={handleButtonClick}
              mx={2}>
              <AttachmentIcon />
            </Button>
            <Button
              onClick={sendMsg}
              mx={2}>
              <LuSendHorizonal fontSize={20} />
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ChatDrawer;
