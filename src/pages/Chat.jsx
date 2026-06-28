import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const getConversationId = (id1, id2, propertyId) => {
  return [id1, id2].sort().join("_") + `_${propertyId}`;
};

export default function Chat() {
  const { conversationId: urlConvId } = useParams();
  const { user, token } = useAuth();
  const { socket, isOnline } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(urlConvId || null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [convInfo, setConvInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const typingActive = useRef(false);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const parseConvId = (convId) => {
    if (!convId) return null;
    const parts = convId.split("_");
    if (parts.length < 3) return null;
    const propertyId = parts[parts.length - 1];
    const userIds = parts.slice(0, parts.length - 1);
    const otherId = userIds.find(id => id !== user?._id);
    return { otherId, propertyId };
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("https://huisverhuur-production.up.railway.app/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchConversations(); }, [token]);

  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`https://huisverhuur-production.up.railway.app/api/messages/${activeConv}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        const found = conversations.find(c => c.conversationId === activeConv);
        if (found) setConvInfo(found);
      } catch (err) { console.error(err); }
    };
    fetchMessages();
    if (socket) socket.emit("joinConversation", activeConv);
  }, [activeConv, token, socket]);

  useEffect(() => {
    if (activeConv && conversations.length > 0) {
      const found = conversations.find(c => c.conversationId === activeConv);
      if (found) setConvInfo(found);
    }
  }, [conversations, activeConv]);

  useEffect(() => {
  if (messagesContainerRef.current) {
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }
}, [messages, otherTyping])
useEffect(() => {
  if (!socket) return;

  socket.on("newMessage", (message) => {
    if (message.sender?._id !== user?._id) {
      if (message.conversationId === activeConv) {
        setMessages(prev => prev.find(m => m._id === message._id) ? prev : [...prev, message]);
      }
    }
    fetchConversations();
  });

  socket.on("userTyping", ({ isTyping }) => setOtherTyping(isTyping));

  return () => {
    socket.off("newMessage");
    socket.off("userTyping");
  };
}, [socket, activeConv]);

  const handleSend = async () => {
    if (!content.trim() || !activeConv || sending) return;
    const parsed = parseConvId(activeConv);
    if (!parsed) return;
    const { otherId, propertyId } = parsed;
    setSending(true);
    try {
      const res = await fetch("https://huisverhuur-production.up.railway.app/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: otherId, propertyId, content: content.trim() }),
      });
      const message = await res.json();
      if (!res.ok) return;
      setMessages(prev => prev.find(m => m._id === message._id) ? prev : [...prev, message]);
      
      setContent("");
      handleTypingStop();
      fetchConversations();
      if (!convInfo && message.property) setConvInfo({ conversationId: activeConv, sender: message.sender, receiver: message.receiver, property: message.property });
    } catch (err) { console.error(err); }
    setSending(false);
  };

  const handleTypingStop = () => {
    if (typingActive.current && socket && activeConv) {
      socket.emit("typing", { conversationId: activeConv, isTyping: false });
      typingActive.current = false;
    }
  };

  const handleInputChange = (e) => {
    setContent(e.target.value);
    // Auto resize textarea
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; }
    if (!typingActive.current && socket && activeConv) {
      typingActive.current = true;
      socket.emit("typing", { conversationId: activeConv, isTyping: true });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(handleTypingStop, 1500);
  };

  const getOtherUser = (conv) => {
    if (!conv || !user) return null;
    return conv.sender?._id === user._id ? conv.receiver : conv.sender;
  };

  const getActiveInfo = () => {
    if (convInfo) return convInfo;
    if (messages.length > 0) {
      const msg = messages[0];
      return { conversationId: activeConv, sender: msg.sender, receiver: msg.receiver, property: msg.property };
    }
    return null;
  };

  const activeInfo = getActiveInfo();
  const otherUser = activeInfo ? getOtherUser(activeInfo) : null;

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <>
      <style>{`
        .chat-conv-item:hover { background: var(--fog) !important; }
        .chat-input:focus { border-color: var(--canal) !important; box-shadow: 0 0 0 3px rgba(27,58,92,.08); }
        .chat-send-btn:hover:not(:disabled) { background: #243f61 !important; transform: scale(1.05); }
      `}</style>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "1.5rem 2rem", height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>

        {/* Page title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--display)", color: "var(--canal)", fontSize: "1.6rem", lineHeight: 1.2 }}>Messages</h2>
            <p style={{ color: "var(--mist)", fontSize: ".82rem", marginTop: ".2rem" }}>
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="chat-layout">

          {/* ── LEFT: Conversations ── */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--fog)", background: "var(--white)" }}>

            {/* Search header */}
            <div style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--fog)", background: "var(--sand)" }}>
              <div style={{ fontWeight: 700, color: "var(--canal)", fontSize: ".9rem", marginBottom: ".6rem", letterSpacing: ".02em" }}>
                Conversations
              </div>
              <div style={{ position: "relative" }}>
                <input
                  placeholder="Search conversations..."
                  style={{ width: "100%", border: "1.5px solid var(--stone)", borderRadius: "6px", padding: ".45rem .8rem .45rem 2rem", fontSize: ".8rem", outline: "none", background: "var(--white)", color: "var(--ink)", fontFamily: "var(--body)" }}
                />
                <span style={{ position: "absolute", left: ".6rem", top: "50%", transform: "translateY(-50%)", fontSize: ".8rem", color: "var(--mist)" }}>🔍</span>
              </div>
            </div>

            {/* Conversation list */}
            <div ref={messagesContainerRef} style={{ overflowY: "auto", flex: 1 }}>
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} style={{ padding: "1rem 1.2rem", display: "flex", gap: ".8rem", borderBottom: "1px solid var(--fog)" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--fog)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: ".8rem", background: "var(--fog)", borderRadius: "4px", marginBottom: ".4rem", width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ height: ".7rem", background: "var(--fog)", borderRadius: "4px", width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: ".8rem" }}>💬</div>
                  <div style={{ fontWeight: 600, color: "var(--canal)", fontSize: ".9rem", marginBottom: ".4rem" }}>No conversations yet</div>
                  <p style={{ color: "var(--mist)", fontSize: ".78rem", lineHeight: 1.6 }}>
                    Go to a property listing and click <strong>"Message Landlord"</strong> to start a conversation.
                  </p>
                </div>
              ) : (
                conversations.map(conv => {
                  const other = getOtherUser(conv);
                  if (!other) return null;
                  const isActive = conv.conversationId === activeConv;
                  const initials = `${other.firstName?.[0] || ""}${other.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <div
                      key={conv.conversationId}
                      className="chat-conv-item"
                      onClick={() => { setActiveConv(conv.conversationId); setConvInfo(conv); }}
                      style={{ padding: "1rem 1.2rem", cursor: "pointer", background: isActive ? "#EEF2F7" : "transparent", borderBottom: "1px solid var(--fog)", borderLeft: isActive ? "3px solid var(--canal)" : "3px solid transparent", transition: "all .15s", display: "flex", gap: ".9rem", alignItems: "flex-start" }}
                    >
                      {/* Avatar */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: isActive ? "var(--canal)" : "#4a7aa7", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: ".9rem", letterSpacing: ".02em" }}>
                          {initials}
                        </div>
                        {isOnline(other._id) && (
                          <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "11px", height: "11px", borderRadius: "50%", background: "#22c55e", border: "2.5px solid white" }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".2rem" }}>
                          <div style={{ fontWeight: 700, fontSize: ".88rem", color: isActive ? "var(--canal)" : "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {other.firstName} {other.lastName}
                          </div>
                          <div style={{ fontSize: ".68rem", color: "var(--mist)", flexShrink: 0, marginLeft: ".4rem" }}>
                            {formatDate(conv.createdAt)}
                          </div>
                        </div>
                        <div style={{ fontSize: ".75rem", color: "var(--tulip)", fontWeight: 500, marginBottom: ".2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          🏠 {conv.property?.title}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: ".76rem", color: "var(--mist)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            {conv.content?.length > 40 ? conv.content.slice(0, 40) + "..." : conv.content}
                          </div>
                          {conv.unread > 0 && (
                            <div style={{ background: "var(--tulip)", color: "white", borderRadius: "100px", padding: "1px 7px", fontSize: ".68rem", fontWeight: 700, flexShrink: 0, marginLeft: ".4rem" }}>
                              {conv.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── RIGHT: Message area ── */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#FAFBFC" }}>

            {!activeConv ? (
              /* Empty state */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "var(--mist)", padding: "2rem" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--fog)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                  💬
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "1.2rem", color: "var(--canal)", marginBottom: ".4rem" }}>
                    Your messages
                  </div>
                  <p style={{ fontSize: ".85rem", lineHeight: 1.6 }}>
                    Select a conversation from the left<br/>or start one from a property listing
                  </p>
                </div>
                <button className="btn-primary" style={{ marginTop: ".5rem" }} onClick={() => navigate("/listings")}>
                  Browse Properties
                </button>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{ padding: ".9rem 1.4rem", borderBottom: "1px solid var(--fog)", background: "var(--white)", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,.05)", flexShrink: 0 }}>
                  {otherUser ? (
                    <>
                      <div style={{ position: "relative" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--canal)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: ".88rem" }}>
                          {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                        </div>
                        {isOnline(otherUser._id) && (
                          <div style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", border: "2px solid white" }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "var(--canal)", fontSize: ".92rem" }}>
                          {otherUser.firstName} {otherUser.lastName}
                          <span style={{ fontWeight: 400, fontSize: ".72rem", color: isOnline(otherUser._id) ? "#22c55e" : "var(--mist)", marginLeft: ".6rem" }}>
                            {isOnline(otherUser._id) ? "● Online now" : "● Offline"}
                          </span>
                        </div>
                        {activeInfo?.property && (
                          <div style={{ fontSize: ".74rem", color: "var(--mist)", marginTop: ".1rem" }}>
                            💬 Re: <span style={{ color: "var(--canal)", fontWeight: 500 }}>{activeInfo.property.title}</span> · {activeInfo.property.city}
                          </div>
                        )}
                      </div>
                      {activeInfo?.property?._id && (
                        <button
                          onClick={() => navigate(`/listings/${activeInfo.property._id}`)}
                          style={{ background: "var(--sand)", border: "1.5px solid var(--stone)", color: "var(--canal)", padding: ".4rem .9rem", borderRadius: "6px", fontSize: ".76rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s" }}
                        >
                          🏠 View Property
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "var(--mist)", fontSize: ".85rem" }}>Loading conversation...</div>
                  )}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.2rem 1.4rem", display: "flex", flexDirection: "column", gap: ".4rem" }}>

                  {messages.length === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                      <div style={{ fontSize: "2rem", marginBottom: ".6rem" }}>👋</div>
                      <div style={{ color: "var(--mist)", fontSize: ".85rem" }}>
                        No messages yet — say hello!
                      </div>
                    </div>
                  )}

                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Date divider */}
                      <div style={{ display: "flex", alignItems: "center", gap: ".8rem", margin: ".8rem 0" }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--fog)" }} />
                        <span style={{ fontSize: ".7rem", color: "var(--mist)", fontWeight: 500, background: "#FAFBFC", padding: "0 .4rem" }}>{date}</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--fog)" }} />
                      </div>

                      {msgs.map((msg, i) => {
                        const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                        const prevMsg = msgs[i - 1];
                        const showAvatar = !isMine && (!prevMsg || prevMsg.sender?._id !== msg.sender?._id);
                        const senderInitials = `${msg.sender?.firstName?.[0] || ""}${msg.sender?.lastName?.[0] || ""}`.toUpperCase();

                        return (
                          <div key={msg._id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: ".3rem", alignItems: "flex-end", gap: ".5rem" }}>

                            {/* Other user avatar */}
                            {!isMine && (
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: showAvatar ? "#4a7aa7" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: ".65rem", flexShrink: 0 }}>
                                {showAvatar ? senderInitials : ""}
                              </div>
                            )}

                            {/* Bubble */}
                            <div style={{ maxWidth: "65%" }}>
                              <div style={{
                                background: isMine ? "var(--canal)" : "var(--white)",
                                color: isMine ? "white" : "var(--ink)",
                                padding: ".65rem 1rem",
                                borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                fontSize: ".88rem",
                                lineHeight: 1.55,
                                boxShadow: isMine ? "none" : "0 1px 4px rgba(0,0,0,.08)",
                                border: isMine ? "none" : "1px solid var(--fog)",
                                wordBreak: "break-word",
                              }}>
                                {msg.content}
                              </div>
                              <div style={{ fontSize: ".65rem", color: "var(--mist)", marginTop: ".25rem", textAlign: isMine ? "right" : "left", paddingLeft: isMine ? 0 : ".2rem", paddingRight: isMine ? ".2rem" : 0 }}>
                                {formatTime(msg.createdAt)}
                                {isMine && <span style={{ marginLeft: ".3rem", color: msg.read ? "#22c55e" : "var(--mist)" }}>{msg.read ? "✓✓" : "✓"}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {otherTyping && (
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: ".5rem" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#4a7aa7", flexShrink: 0 }} />
                      <div style={{ background: "var(--white)", border: "1px solid var(--fog)", borderRadius: "16px 16px 16px 4px", padding: ".6rem 1rem", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          {[0,1,2].map(i => (
                            <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--mist)", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid var(--fog)", background: "var(--white)", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: ".8rem", alignItems: "flex-end", background: "var(--sand)", borderRadius: "12px", padding: ".6rem .8rem .6rem 1rem", border: "1.5px solid var(--fog)", transition: "border-color .2s" }}
                    onFocus={() => {}} onBlur={() => {}}>
                    <textarea
                      ref={textareaRef}
                      rows="1"
                      placeholder="Type a message..."
                      value={content}
                      onChange={handleInputChange}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--body)", fontSize: ".9rem", color: "var(--ink)", resize: "none", lineHeight: 1.5, maxHeight: "120px", minHeight: "24px" }}
                    />
                    <button
                      className="chat-send-btn"
                      onClick={handleSend}
                      disabled={!content.trim() || sending}
                      style={{ background: content.trim() && !sending ? "var(--canal)" : "var(--stone)", color: "white", border: "none", borderRadius: "8px", width: "38px", height: "38px", cursor: content.trim() && !sending ? "pointer" : "not-allowed", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
                    >
                      {sending ? "⏳" : "➤"}
                    </button>
                  </div>
                  <div style={{ fontSize: ".68rem", color: "var(--mist)", marginTop: ".4rem", textAlign: "center" }}>
                    Press Enter to send · Shift+Enter for new line
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </>
  );
}