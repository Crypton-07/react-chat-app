import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_CHANNELS_MESSAGES, GET_MESSAGES, HOST } from "@/utils/constant";
// import { FilePen } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessage,
    setSelectedChatMessage,
    setFileDownloadProgress,
    setIsDownloading,
    userInfo,
  } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const scrollRef = useRef();
  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_MESSAGES,
          {
            id: selectedChatData._id,
          },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessage(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };
    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNELS_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessage(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };
    if (selectedChatData._id) {
      if (selectedChatType === "Contact") {
        getMessages();
      }
      if (selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessage]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessage]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|gif|jpeg|tiff|png|webp|bmp|svg|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const downloadFile = async (file) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const response = await apiClient.get(`${HOST}/${file}`, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const downloadPercent = Math.round((loaded * 100) / total);
        setFileDownloadProgress(downloadPercent);
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", file.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderMessage = () => {
    let lastDate = null;
    return selectedChatMessage.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timeStamp).format("LL")}
            </div>
          )}
          {selectedChatType === "Contact" && renderDmMessage(message)}
          {selectedChatType === "channel" && renderChannelMessage(message)}
        </div>
      );
    });
  };

  const renderDmMessage = (message) => (
    <div
      className={`${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender === selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-white/20"
          } border inline-block py-2 px-3 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender === selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-white/20"
          } border inline-block p-2 rounded my-1 max-w-[50%] break-words`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageUrl(message.fileUrl);
              }}
            >
              <img
                src={`${HOST}/${message.fileUrl}`}
                height={200}
                width={200}
                alt="Image"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-white/80 text-2xl bg-black/20 rounded-full p-2">
                <MdFolderZip />
              </span>
              <span className="">{message.fileUrl.split("/").pop()}</span>
              <span
                className="p-2 bg-black/20 rounded-full text-2xl hover:bg-black/50 cursor-pointer transition-all duration-200"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-200">
        {moment(message.timeStamp).format("LT")}
      </div>
    </div>
  );
  const renderChannelMessage = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        {message.sender._id !== userInfo.id && (
          <div className="flex items-center justify-start gap-2 mb-1">
            <Avatar className="h-6 w-6 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback
                className={`uppercase h-6 w-6 text-lg flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-200">
              {`${message.sender.firstName} ${message.sender.lastName}`}
            </span>
            <span className="text-xs text-gray-200">
              {moment(message.timeStamp).format("LT")}
            </span>
          </div>
        )}
        {message.messageType === "text" && (
          <div
            className={`ml-7 ${
              message.sender._id === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/20"
            } border inline-block py-2 px-3 rounded my-1 max-w-[50%] break-words`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/20"
            } border inline-block p-2 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  height={200}
                  width={200}
                  alt="Image"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 cursor-pointer">
                <span className="text-white/80 text-2xl bg-black/20 rounded-full p-2">
                  <MdFolderZip />
                </span>
                <span className="">{message.fileUrl.split("/").pop()}</span>
                <span
                  className="p-2 bg-black/20 rounded-full text-2xl hover:bg-black/50 cursor-pointer transition-all duration-200"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {message.sender._id === userInfo.id && (
          <div className="text-xs mt-1 text-gray-200">
            {moment(message.timeStamp).format("LT")}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden px-8 p-4 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] ">
      {renderMessage()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[100] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg">
          <div>
            <img
              className="h-[80vh] w-full bg-cover"
              src={`${HOST}/${imageUrl}`}
              alt="image"
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    className="p-2 bg-black/20 rounded-full text-2xl hover:bg-black/50 cursor-pointer transition-all duration-200"
                    onClick={() => downloadFile(imageUrl)}
                  >
                    <IoMdArrowRoundDown />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none text-white ">
                  <p>Download</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    className="p-2 bg-black/20 rounded-full text-2xl hover:bg-black/50 cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setShowImage(false);
                      setImageUrl(null);
                    }}
                  >
                    <IoCloseSharp />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none text-white ">
                  <p>Cancel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
