import React, { useState, useRef, useEffect } from 'react'
import { apiClient } from '../lib/api'
import { MessageSquare, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react'

export default function AIChat({ caseId = null }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message when component mounts
    const welcomeMessage = {
      role: 'ai',
      content: caseId 
        ? `Hello! I'm ready to help you analyze and discuss this specific legal case. What would you like to know?`
        : `Hello! I'm your AI legal assistant. I can help you with legal questions, case analysis, and research. How can I assist you today?`
    }
    setMessages([welcomeMessage])
  }, [caseId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || loading) return

    const userMessage = { role: 'user', content: inputMessage }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)
    setError('')

    try {
      let response
      if (caseId) {
        // Chat with specific case
        response = await apiClient.chatWithCase(caseId, inputMessage)
      } else {
        // General AI chatbot
        response = await apiClient.chatbot(inputMessage)
      }

      const aiMessage = { 
        role: 'ai', 
        content: response.message || response.answer || response || 'I apologize, but I could not generate a response.'
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message: ' + error.message)
      const errorMessage = { 
        role: 'ai', 
        content: 'Sorry, I encountered an error while processing your request. Please try again or rephrase your question.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const clearChat = () => {
    const welcomeMessage = {
      role: 'ai',
      content: caseId 
        ? `Hello! I'm ready to help you analyze and discuss this specific legal case. What would you like to know?`
        : `Hello! I'm your AI legal assistant. How can I assist you today?`
    }
    setMessages([welcomeMessage])
    setError('')
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {caseId ? 'Chat with Case' : 'AI Legal Assistant'}
          </h3>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'ai' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={caseId ? "Ask about this case..." : "Ask a legal question..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            disabled={loading}
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        
        {/* Helpful suggestions */}
        {messages.length === 1 && !loading && (
          <div className="mt-3 flex flex-wrap gap-2">
            <p className="text-xs text-gray-500 w-full mb-2">Suggested questions:</p>
            {caseId ? (
              <>
                <button
                  onClick={() => setInputMessage("Can you summarize the key points of this case?")}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Summarize this case
                </button>
                <button
                  onClick={() => setInputMessage("What are the legal precedents mentioned in this case?")}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Legal precedents
                </button>
                <button
                  onClick={() => setInputMessage("What was the court's reasoning?")}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Court's reasoning
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setInputMessage("What are the key principles of contract law?")}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Contract law basics
                </button>
                <button
                  onClick={() => setInputMessage("How do I file a civil lawsuit?")}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Filing a lawsuit
                </button>
                <button
                  onClick={() => setInputMessage("What is the difference between tort and criminal law?")}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Tort vs Criminal law
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}