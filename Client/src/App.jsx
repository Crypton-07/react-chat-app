/* eslint-disable react/prop-types */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth/Auth";
import Chat from "./pages/chat/Chat";
import Profile from "./pages/profile/Profile";
// import { Children } from "react";
import { useAppStore } from "./store";
import { useEffect, useState } from "react";
import apiClient from "./lib/api-client";
import { GET_USERINFO } from "./utils/constant";
// import { Button } from "./components/ui/button";
const PrivateRoutes = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to={"/auth"} />;
};
const AuthRoutes = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to={"/chat"} /> : children;
};
function App() {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USERINFO, {
          withCredentials: true,
        });
        if (response.status == 200 && response.data.id) {
          setUserInfo(response.data);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);
  if (loading) {
    return <div>Loading ...</div>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoutes>
              <Auth />
            </AuthRoutes>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoutes>
              <Chat />
            </PrivateRoutes>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoutes>
              <Profile />
            </PrivateRoutes>
          }
        />
        <Route path="*" element={<Navigate to={"/auth"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
