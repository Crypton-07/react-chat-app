import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Background from "../../assets/login2.png";
import Victory from "../../assets/victory.svg";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { LOGIN_ROUTES, SIGNUP_ROUTES } from "@/utils/constant";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleValidateSignup = () => {
    if (!email) {
      toast.error("email is required");
      return false;
    }
    if (!password) {
      toast.error("password is required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and confirm password should be same");
      return false;
    }
    return true;
  };
  const handleValidateLogin = () => {
    if (!email) {
      toast.error("email is required");
      return false;
    }
    if (!password) {
      toast.error("password is required");
      return false;
    }
    return true;
  };
  const handleLogin = async () => {
    if (handleValidateLogin()) {
      const response = await apiClient.post(
        LOGIN_ROUTES,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.user.id) {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }
      }
    }
  };
  const handleSignup = async () => {
    if (handleValidateSignup()) {
      const response = await apiClient.post(
        SIGNUP_ROUTES,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      toast.success("Signup successful");
      if (response.status === 201) {
        setUserInfo(response.data.user);
        navigate("/profile");
      }
    }
  };
  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[85vw] md:w-[75vw] lg:w-[65vw] xl:w-[55vw rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="flex justify-center items-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="victory" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Welcome to this chat application
            </p>
          </div>
          <div className="flex justify-center items-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all ease-in duration-200"
                  value="login"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all ease-in duration-200"
                  value="signup"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-4 mt-10" value="login">
                <Input
                  className="rounded-full p-4"
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  className="rounded-full p-4"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className="rounded-full p-4" onClick={handleLogin}>
                  Log In
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-4" value="signup">
                <Input
                  className="rounded-full p-5"
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  className="rounded-full p-5"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  className="rounded-full p-5"
                  type="password"
                  placeholder="confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full p-5" onClick={handleSignup}>
                  Sign Up
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="background login" className="h-[90%]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
