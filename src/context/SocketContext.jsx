import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !token) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }

    const newSocket = io("https://huisverhuur-production.up.railway.app", {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("messageNotification", (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [user, token]);

  const clearNotifications = () => setNotifications([]);
  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications, clearNotifications, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}