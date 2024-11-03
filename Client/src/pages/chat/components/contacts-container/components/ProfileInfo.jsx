import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import apiClient from "@/lib/api-client";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST, LOGOUT_ROUTES } from "@/utils/constant";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const { firstName, lastName, color, image, email } = userInfo;
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const response = await apiClient.post(
        LOGOUT_ROUTES,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        setUserInfo(null);
        navigate("/auth");
      }
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-4 w-full bg-[#2a2b33] cursor-pointer">
      <div className="flex gap-3 items-center justify-center">
        <div>
          <Avatar className="h-10 w-10 rounded-full overflow-hidden">
            {image ? (
              <AvatarImage
                src={`${HOST}/${image}`}
                alt="profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase h-10 w-10 text-lg flex items-center justify-center rounded-full ${getColor(
                  color
                )}`}
              >
                {firstName
                  ? firstName.split("").shift()
                  : email.split("").shift()}
              </div>
            )}
          </Avatar>
        </div>
        <div>{firstName && lastName ? `${firstName} ${lastName}` : ""}</div>
      </div>
      <div className="flex gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2
                className="text-purple-500 text-xl font-medium "
                onClick={() => navigate("/profile")}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white ">
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp
                className="text-purple-500 text-xl font-medium "
                onClick={handleLogout}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white ">
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileInfo;
