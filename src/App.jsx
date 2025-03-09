"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { format } from "date-fns"
import { FiSend, FiMoon, FiSun, FiMoreVertical, FiPhone, FiVideo, FiImage, FiSmile, FiMic } from "react-icons/fi"
import { SiPostman } from "react-icons/si"
import { useSpring, animated, useTransition } from "@react-spring/web"

const App = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingIndicatorRef = useRef(null)
  const chatContainerRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/messages")
      setMessages(
        response.data.map((msg) => ({
          ...msg,
          isBot: true,
          timestamp: new Date(msg.timestamp),
        })),
      )
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  useEffect(() => {
    fetchMessages()
    // Check for user's preferred color scheme
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
    }
  }, []) // Added empty dependency array to fix the warning

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Scroll to the end of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesEndRef]) // Changed dependency to messagesEndRef to fix the warning

  // Scroll to typing indicator when it appears
  useEffect(() => {
    if (isTyping && typingIndicatorRef.current) {
      setTimeout(() => {
        typingIndicatorRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100) // Small delay to ensure the element is rendered
    }
  }, [isTyping])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      setIsLoading(true)
      const timestamp = new Date()
      const newMessage = { text: input, isBot: false, timestamp }

      try {
        // Add user message to the UI immediately
        setMessages((prevMessages) => [...prevMessages, newMessage])
        setInput("")

        // Send user message to the server
        await axios.post("http://localhost:5000/messages", newMessage)

        // Show typing indicator
        setIsTyping(true)

        // Simulate a delay for the bot response
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Hide typing indicator
        setIsTyping(false)

        // Simulate a bot response
        const botResponse = simulateBotResponse(input)
        const botMessage = { text: botResponse, isBot: true, timestamp: new Date() }

        // Send bot message to the server
        await axios.post("http://localhost:5000/messages", botMessage)

        // Add bot message to the UI
        setMessages((prevMessages) => [...prevMessages, botMessage])
      } catch (error) {
        console.error("Error sending message:", error)
        alert("Failed to send message. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const simulateBotResponse = (userMessage) => {
    const responses = {
      greetings: ["Hi there! How can I help you today?", "Hello! What can I do for you?", "Hey! How are you doing?"],
      howAreYou: [
        "I am just a bot, but thanks for asking!",
        "Doing great! What about you?",
        "I don't have feelings, but I'm here to help!",
      ],
      default: [
        "I am not sure how to respond to that.",
        "Can you please clarify?",
        "That sounds interesting! Tell me more.",
      ],
    }

    const lowerCaseMessage = userMessage.toLowerCase()

    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      return randomResponse(responses.greetings)
    } else if (lowerCaseMessage.includes("how are you")) {
      return randomResponse(responses.howAreYou)
    } else {
      return randomResponse(responses.default)
    }
  }

  const randomResponse = (responseArray) => {
    const randomIndex = Math.floor(Math.random() * responseArray.length)
    return responseArray[randomIndex]
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // React Spring animations
  const onlineIndicator = useSpring({
    from: { scale: 1 },
    to: async (next) => {
      while (true) {
        await next({ scale: 1.2 })
        await next({ scale: 1 })
      }
    },
    config: { duration: 2000 },
  })

  const typingDots = [
    useSpring({
      from: { transform: "translateY(0px)" },
      to: async (next) => {
        while (true) {
          await next({ transform: "translateY(-5px)" })
          await next({ transform: "translateY(0px)" })
        }
      },
      config: { duration: 1000 },
    }),
    useSpring({
      from: { transform: "translateY(0px)" },
      to: async (next) => {
        while (true) {
          await next({ transform: "translateY(-5px)" })
          await next({ transform: "translateY(0px)" })
        }
      },
      config: { duration: 1000, delay: 200 },
    }),
    useSpring({
      from: { transform: "translateY(0px)" },
      to: async (next) => {
        while (true) {
          await next({ transform: "translateY(-5px)" })
          await next({ transform: "translateY(0px)" })
        }
      },
      config: { duration: 1000, delay: 400 },
    }),
  ]

  // Fix for the "Cannot convert a Symbol value to a string" error
  // Use a simple index as the key instead of the item itself
  const messageTransitions = useTransition(messages, {
    from: { opacity: 0, y: 20, scale: 0.9 },
    enter: { opacity: 1, y: 0, scale: 1 },
    config: { duration: 300 },
    keys: (_, index) => `message-${index}`,
  })

  // Fix for the typing indicator transition
  const typingTransition = useTransition(isTyping, {
    from: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 20 },
    config: { duration: 200 },
  })

  const buttonSpring = useSpring({
    scale: isLoading || !input.trim() ? 1 : 1.05,
    config: { tension: 300, friction: 10 },
  })

  return (
    <div
      className={`flex flex-col h-screen max-w-md mx-auto shadow-2xl rounded-xl overflow-hidden ${isDarkMode ? "dark" : ""}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-gray-800 dark:to-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full bg-white dark:bg-gray-700 mr-3 flex items-center justify-center overflow-hidden shadow-md">
            <SiPostman className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            <animated.div
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-700"
              style={onlineIndicator}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">Postman</h1>
            <p className="text-xs text-blue-100 dark:text-gray-400">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
            <FiPhone className="text-xl" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
            <FiVideo className="text-xl" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
            <FiMoreVertical className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm"
        style={{
          backgroundImage: isDarkMode
            ? "radial-gradient(circle at 10% 20%, rgba(21, 21, 21, 0.02) 0%, rgba(21, 21, 21, 0.02) 33.333%, rgba(34, 34, 34, 0.02) 33.333%, rgba(34, 34, 34, 0.02) 66.666%, rgba(13, 13, 13, 0.02) 66.666%, rgba(13, 13, 13, 0.02) 99.999%)"
            : "radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.46) 0%, rgba(216, 241, 230, 0.46) 33.333%, rgba(255, 255, 255, 0.46) 33.333%, rgba(255, 255, 255, 0.46) 66.666%, rgba(216, 241, 230, 0.46) 66.666%, rgba(216, 241, 230, 0.46) 99.999%)",
        }}
      >
        {/* Render messages with fixed keys */}
        {messageTransitions((style, msg, _, index) => (
          <animated.div
            key={`msg-${index}`}
            style={style}
            className={`flex items-start space-x-2 ${msg.isBot ? "justify-start" : "justify-end"}`}
          >
            {!msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden order-2 shadow-md">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTNjkaQHLXfokbl1GiKnXl6v7GNgnG8rb3JA&s"
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`flex flex-col ${msg.isBot ? "items-start" : "items-end"} max-w-xs space-y-1 order-1`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  msg.isBot
                    ? "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 shadow-sm"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                } transition-all duration-300 ease-in-out hover:scale-[1.02]`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2">{format(msg.timestamp, "HH:mm")}</span>
            </div>
            {msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden order-0 shadow-md">
                <SiPostman className="text-blue-500 dark:text-blue-400 w-6 h-6" />
              </div>
            )}
          </animated.div>
        ))}

        {/* Typing indicator with fixed key and ref */}
        {typingTransition(
          (style, item) =>
            item && (
              <animated.div
                ref={typingIndicatorRef}
                key="typing-indicator"
                style={style}
                className="flex items-start space-x-2 justify-start mb-8" // Added margin bottom for spacing
              >
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-md">
                  <SiPostman className="text-blue-500 dark:text-blue-400 w-6 h-6" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    {typingDots.map((style, i) => (
                      <animated.div
                        key={`dot-${i}`}
                        className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                        style={style}
                      />
                    ))}
                  </div>
                </div>
              </animated.div>
            ),
        )}

        {/* Extra space at the bottom to ensure visibility */}
        <div className="h-16" ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FiSmile className="text-xl" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FiImage className="text-xl" />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <FiMic className="text-lg" />
            </button>
          </div>
          <animated.button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={buttonSpring}
            className={`p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-md ${
              isLoading || !input.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FiSend className="text-xl" />
          </animated.button>
        </div>
      </form>
    </div>
  )
}

export default App

