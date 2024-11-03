import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constant";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [selectColor, setSelectColor] = useState(0);
  const [hovered, setHovered] = useState(null);
  const fileInput = useRef(null);
  const validateProfile = () => {
    if (!firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Laste name is required");
      return false;
    }
    return true;
  };
  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName,
            lastName,
            color: selectColor,
          },
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setUserInfo({ ...response.data });
          toast.success("Profile updated successfully !");
          navigate("/chat");
        }
      } catch (error) {
        console.log({ error });
      }
    }
  };
  const handleNavigate = () => {
    if (userInfo?.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please complete your profile setup!");
    }
  };
  const handleFileInput = () => {
    fileInput.current.click();
  };
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        toast.success("Profile image updated successfully");
      }
    }
  };
  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        toast.success("Profile image deleted successfully");
        setImage(null);
      }
    } catch (error) {
      console.log({ error });
    }
  };
  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);
  return (
    <div className="bg-[#1b1c24] h-[100vh] flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate}>
          <IoArrowBack className="text-3xl lg:text-4xl text-white/90 cursor-pointer" />
        </div>
        <div className="grid grid-cols-2">
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-28 w-28 md:w-36 md:h-36 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-28 w-28 md:w-36 md:h-36 text-5xl flex items-center justify-center rounded-full ${getColor(
                    selectColor
                  )}`}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo.email.split("").shift()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/10 ring-fuchsia-50 rounded-full cursor-pointer"
                onClick={image ? handleDeleteImage : handleFileInput}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInput}
              className="hidden"
              onChange={handleImageChange}
              name="profile-image"
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 items-center justify-center  text-white">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                value={firstName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                value={lastName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full flex gap-5 justify-between">
              {colors.map((color, i) => (
                <div
                  key={i}
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    selectColor == i ? "outline outline-white outline-1" : ""
                  }`}
                  onClick={() => setSelectColor(i)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className={`h-16 w-full ${getColor(
              selectColor
            )}transition-all duration-150 tracking-wider text-base font-medium`}
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
