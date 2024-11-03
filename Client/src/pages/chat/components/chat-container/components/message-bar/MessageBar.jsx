import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILES_ROUTE } from "@/utils/constant";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const socket = useSocket();

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = () => {
    // if (socket) {
    //   alert("Socket is initialized.");
    //   return;
    // }
    if (selectedChatType === "Contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }
    setMessage("");
  };
  const handleFileAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleAttachmentChange = async (event) => {
    try {
      //
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const response = await apiClient.post(UPLOAD_FILES_ROUTE, formData, {
          withCredentials: true,
          onUploadProgress: (data) =>
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total)),
        });
        if (response.status === 200 && response.data) {
          setIsUploading(false);
          if (selectedChatType === "Contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
            });
          }
          if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
              sender: userInfo.id,
              content: undefined,
              messageType: "file",
              fileUrl: response.data.filePath,
              channelId: selectedChatData._id,
            });
          }
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log({ error });
    }
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);
  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6 ">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5 ">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
          placeholder="Enter a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          onClick={handleFileAttachment}
        >
          <GrAttachment className="text-xl" />
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAttachmentChange}
          />
        </button>
        <div className="relative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={() => setEmojiPickerOpen(true)}
          >
            <RiEmojiStickerLine className="text-xl" />
          </button>
          <div
            className="absolute bottom-12 -right-5 transition-all duration-300"
            ref={emojiRef}
          >
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none focus:outline-none focus:text-white focus:bg-[#741bda] duration-300 transition-all hover:bg-[#741bda]"
        onClick={() => handleSendMessage()}
      >
        <IoSend className="text-xl" />
      </button>
    </div>
  );
};

export default MessageBar;
