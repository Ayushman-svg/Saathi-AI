import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Copy,
  RotateCw,
  Bot,
  Zap,
  Send,
  Cpu,
  Terminal,
  Layers,
  Globe,
  ShieldCheck,
  ChevronRight,
  History,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { studyAI } from "../services/aiService";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const AITools = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState("summary");

  // Chat state
  const [currentChat, setCurrentChat] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load recent chats from local storage
  useEffect(() => {
    const saved = localStorage.getItem("study_companion_recent_chats");
    if (saved) setRecentChats(JSON.parse(saved));
  }, []);

  /* Auto-scroll disabled as per user request to prevent 'keep scrolling' behavior */
  // useEffect(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [currentChat?.messages, chatLoading]);

  const tools = [
    {
      id: "summary",
      name: "Summarize",
      icon: Globe,
      desc: "Generate topic summaries",
    },
    {
      id: "questions",
      name: "Questions",
      icon: Bot,
      desc: "Test your knowledge",
    },
    {
      id: "flashcards",
      name: "Flashcards",
      icon: Sparkles,
      desc: "Create study flashcards",
    },
  ];

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation(); // Prevent loading the chat when deleting
    setRecentChats((prev) => {
      const updated = prev.filter((c) => c.id !== chatId);
      localStorage.setItem(
        "study_companion_recent_chats",
        JSON.stringify(updated),
      );
      return updated;
    });
    toast.info("Chat deleted");
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(null);
    }
  };

  const handleLoadRecent = (chat) => {
    // Ensure older cached chats have a messages array to prevent crashes
    const safeChat = { ...chat, messages: chat.messages || [] };
    setCurrentChat(safeChat);
    setTopic(safeChat.topic);
    setActiveTool(safeChat.tool);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.warning("Please enter a topic");
      return;
    }

    setLoading(true);
    setCurrentChat(null);

    try {
      let data;
      if (activeTool === "summary") data = await studyAI.generateSummary(topic);
      else if (activeTool === "questions")
        data = await studyAI.generateQuestions(topic);
      else if (activeTool === "flashcards")
        data = await studyAI.generateFlashcards(topic);

      const chatData = {
        id: Date.now(),
        topic,
        tool: activeTool,
        result: data,
        messages: [],
        date: new Date().toISOString(),
      };

      setCurrentChat(chatData);

      // Save to recent chats
      setRecentChats((prev) => {
        const updatedChats = [
          chatData,
          ...prev.filter((c) => c.topic !== topic || c.tool !== activeTool),
        ].slice(0, 15);
        localStorage.setItem(
          "study_companion_recent_chats",
          JSON.stringify(updatedChats),
        );
        return updatedChats;
      });

      toast.success("Content generated successfully");
    } catch (error) {
      const errorMsg =
        error.message || "AI generation failed. Please try again later.";
      if (errorMsg.includes("API key") || errorMsg.includes("Unauthorized")) {
        toast.error(
          "API key not configured. Check Vercel environment variables.",
        );
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentChat || chatLoading) return;

    const userMsg = { role: "user", content: chatInput };
    const updatedChat = {
      ...currentChat,
      messages: [...(currentChat.messages || []), userMsg],
    };

    setCurrentChat(updatedChat);
    setChatInput("");
    setChatLoading(true);

    try {
      const reply = await studyAI.continueChat(
        { topic: currentChat.topic, result: currentChat.result },
        currentChat.messages, // Pass history before adding this new message
        userMsg.content,
      );

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, { role: "model", content: reply }],
      };
      setCurrentChat(finalChat);

      setRecentChats((prev) => {
        const newRecent = prev.map((c) =>
          c.id === finalChat.id ? finalChat : c,
        );
        localStorage.setItem(
          "study_companion_recent_chats",
          JSON.stringify(newRecent),
        );
        return newRecent;
      });
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setChatLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentChat) return;
    navigator.clipboard.writeText(currentChat.result);
    toast.info("Copied to clipboard");
  };

  const MarkdownComponents = {
    h1: ({ node, ...props }) => (
      <h1
        className="text-2xl font-bold mt-6 mb-3 text-slate-900 uppercase tracking-tight"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="text-xl font-bold mt-5 mb-3 text-slate-900 uppercase"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-bold mt-4 mb-2 text-slate-700" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-4 leading-relaxed" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul
        className="list-disc pl-6 mb-4 space-y-1.5 marker:text-slate-600"
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        className="list-decimal pl-6 mb-4 space-y-1.5 marker:text-slate-600 font-bold text-slate-900"
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li className="text-slate-700 font-medium mb-1.5" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-slate-900" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-slate-300 bg-slate-100/50 pl-5 py-2 pr-4 italic text-slate-600 my-4 rounded-r-xl shadow-inner"
        {...props}
      />
    ),
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code
          className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200"
          {...props}
        />
      ) : (
        <pre className="bg-slate-900 p-4 rounded-xl overflow-x-auto text-sm font-mono text-zinc-100 border border-slate-700 my-4 shadow-2xl">
          <code {...props} />
        </pre>
      ),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight  uppercase">
            STUDY ASSISTANT
          </h3>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wider hidden md:block leading-none mt-1">
            AI-Powered Study Tools
          </p>
        </div>
      </div>

      {/* Landscape Mode Tool Selector */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-2 md:p-3 border-slate-200 bg-white relative overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row items-center gap-3 relative z-10">
          <div className="flex-1 flex gap-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold uppercase transition-all border relative overflow-hidden group/btn ${activeTool === tool.id ? "bg-slate-100/50 border-slate-300 text-slate-900" : "bg-slate-50/50 border-slate-200 text-slate-500 hover:text-slate-900"}`}
              >
                <tool.icon
                  className={`w-3.5 h-3.5 ${activeTool === tool.id ? "text-slate-700" : "text-slate-700"}`}
                />
                <span className="text-sm tracking-wider leading-none">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full lg:w-[350px]">
            <div className="relative flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-4 shadow-inner focus-within:border-slate-300 transition-all h-10">
              <Terminal className="w-3.5 h-3.5 text-slate-600/50 mr-3" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Topic..."
                className="w-full bg-transparent border-0 outline-none text-xs text-slate-900 placeholder-slate-800 font-bold uppercase tracking-wider"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerate()}
            disabled={loading || !topic}
            className="w-full lg:w-28 h-10 bg-blue-600 text-white text-slate-900 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {loading ? (
              <RotateCw className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Zap className="w-3 h-3" /> Go
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Split Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[500px]">
        {/* Result Section */}
        <div className="xl:col-span-8 flex flex-col gap-4 h-full min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full w-full glass-card border-dashed border-2 flex flex-col items-center justify-center gap-10 border-slate-200 bg-white/20"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-zinc-400 animate-spin" />
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-slate-100/50 hidden animate-pulse" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="font-bold text-slate-900 uppercase tracking-tight text-2xl animate-pulse">
                    Generating Content
                  </p>
                  <p className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em]">
                    Processing your request for {topic}...
                  </p>
                </div>
              </motion.div>
            ) : currentChat ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card flex flex-col overflow-hidden h-full border-slate-200 bg-white shadow-2xl relative"
              >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-100 backdrop-blur-md relative z-10 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-xl border border-slate-300 text-slate-700">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600 italic pb-0.5">
                        AI Output
                      </h4>
                      <h5 className="text-lg font-bold text-slate-900 uppercase tracking-tight leading-none">
                        {currentChat.topic}
                      </h5>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyToClipboard}
                    className="p-3 hover:bg-slate-200 rounded-xl text-slate-700 hover:text-slate-900 transition-all border border-slate-200"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="flex flex-col grow overflow-y-auto relative z-10 custom-scrollbar">
                  <div className="p-8">
                    <div className="space-y-0">
                      {/* AI Response starts immediately to save space */}
                      <div className="flex gap-4 py-6 bg-white/30 -mx-8 px-8 border-b border-slate-200">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-slate-100 border border-slate-300 text-slate-700 shadow-inner">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div className="grow overflow-hidden">
                          <div className="font-bold text-sm text-slate-600/80 mb-2 uppercase tracking-wider flex items-center gap-2">
                            Study AI <Sparkles className="w-3 h-3" />
                          </div>
                          <div className="font-medium text-slate-700 text-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={MarkdownComponents}
                            >
                              {currentChat.result}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      {/* Chat History */}
                      {currentChat.messages &&
                        currentChat.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-4 py-8 ${msg.role === "model" ? "border-b border-slate-200 bg-white/30 -mx-8 px-8" : ""}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === "user" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 border border-slate-300 text-slate-700 shadow-inner"}`}
                            >
                              {msg.role === "user" ? (
                                <Terminal className="w-4 h-4" />
                              ) : (
                                <Bot className="w-5 h-5" />
                              )}
                            </div>
                            <div className="grow overflow-hidden">
                              <div
                                className={`font-bold text-sm mb-2 uppercase tracking-wider ${msg.role === "user" ? "text-slate-600" : "text-slate-600/80 flex items-center gap-2"}`}
                              >
                                {msg.role === "user" ? (
                                  "You"
                                ) : (
                                  <>
                                    Study AI <Sparkles className="w-3 h-3" />
                                  </>
                                )}
                              </div>
                              <div className="font-medium text-slate-700 text-sm max-w-none">
                                {msg.role === "user" ? (
                                  <div className="text-base text-slate-900 whitespace-pre-wrap">
                                    {msg.content}
                                  </div>
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={MarkdownComponents}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Loading Indicator */}
                      {chatLoading && (
                        <div className="flex gap-4 py-8 border-b border-slate-200 bg-white/30 -mx-8 px-8">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-slate-100 border border-slate-300 text-slate-700 shadow-inner">
                            <Bot className="w-5 h-5" />
                          </div>
                          <div className="grow overflow-hidden">
                            <div className="font-bold text-sm text-slate-600/80 mb-2 uppercase tracking-wider flex items-center gap-2">
                              Study AI <Sparkles className="w-3 h-3" />
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" />
                              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce delay-100" />
                              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Chat Input Area */}
                <div className="p-4 bg-slate-50/80 backdrop-blur-md border-t border-slate-200 relative z-20 shrink-0">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      disabled={chatLoading}
                      placeholder="Ask a follow up question..."
                      className="w-full bg-white border border-slate-300 focus:border-slate-400 outline-none rounded-xl pl-5 pr-14 py-4 text-sm text-slate-900 placeholder-slate-500 transition-all shadow-inner disabled:hidden0"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={chatLoading || !chatInput.trim()}
                      className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-zinc-300 transition-colors disabled:hidden0 disabled:grayscale"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="absolute -bottom-20 -right-20 hidden pointer-events-none transition-transform duration-1000">
                  <Layers className="w-96 h-96" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full w-full glass-card border-dashed border-2 flex flex-col items-center justify-center text-center opacity-10 gap-8 border-slate-300 bg-white/10 group overflow-hidden relative"
              >
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-700 flex items-center justify-center relative overflow-hidden">
                  <Brain className="w-10 h-10 text-slate-600" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900 uppercase tracking-tight text-2xl">
                    Result View
                  </p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
                    Output will appear here
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Chats Section */}
        <div className="xl:col-span-4 h-full min-h-[400px]">
          <div className="glass-card flex flex-col overflow-hidden h-full border-slate-200 bg-white shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-slate-100 backdrop-blur-md shrink-0">
              <History className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                Recent Chats
              </h4>
            </div>
            <div className="p-6 grow overflow-y-auto space-y-3 custom-scrollbar">
              {recentChats.length > 0 ? (
                recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleLoadRecent(chat)}
                    className="w-full text-left p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-all group flex items-start gap-4 cursor-pointer"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-100 group-hover:text-slate-700 text-slate-600 transition-colors shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden grow">
                      <h5 className="text-sm font-bold text-slate-900 truncate">
                        {chat.topic}
                      </h5>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100/50 px-1.5 py-0.5 rounded">
                          {tools.find((t) => t.id === chat.tool)?.name ||
                            chat.tool}
                        </span>
                        {chat.messages && chat.messages.length > 0 && (
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            {(chat.messages.length / 2).toFixed(0)} Follow-ups
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded-lg transition-all shrink-0 self-center"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 hidden0 space-y-4">
                  <MessageSquare className="w-8 h-8" />
                  <p className="text-sm font-bold uppercase tracking-wider">
                    No recent history
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 p-40 hidden pointer-events-none select-none -mr-40 -mt-20 overflow-hidden">
        <Globe className="w-[800px] h-[800px] rotate-12 hidden text-slate-600" />
      </div>
    </motion.div>
  );
};

export default AITools;
