import React, { useState } from 'react';
import { Sparkles, Send, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import kenyaLawApi from '../lib/kenyaLawApi';

export default function AiAssistantTab() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState('');
  const [error, setError] = useState(null);

  const suggestedQuestions = [
    {
      text: "What are the key provisions of this maritime charter?",
      category: "Legal Analysis"
    },
    {
      text: "How many countries have signed this charter?",
      category: "Factual"
    },
    {
      text: "What are the objectives of maritime security mentioned in the document?",
      category: "Content Summary"
    },
    {
      text: "Explain the definitions of piracy and armed robbery against ships",
      category: "Legal Definitions"
    },
    {
      text: "What cooperation mechanisms are established by this charter?",
      category: "Legal Framework"
    },
    {
      text: "What are the monitoring and control provisions?",
      category: "Compliance"
    }
  ];

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    if (!documentId.trim()) {
      setError('Please provide a document ID from a scraped document to chat with');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await kenyaLawApi.chatWithDocument({
        message: question,
        document_id: documentId,
        context: chatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        references: response.document_references || [],
        confidence: response.confidence,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiMessage]);
      setQuestion('');
    } catch (err) {
      setError(err.message);
      // Remove the user message if the AI response failed
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (suggestedText) => {
    setQuestion(suggestedText);
  };

  const clearChat = () => {
    setChatHistory([]);
    setError(null);
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-purple-900 mb-2">AI Legal Assistant</h3>
            <p className="text-sm text-purple-700 mb-4">
              Ask questions about scraped legal documents. The AI will analyze document content and provide detailed answers based on the scraped information.
            </p>
            
            {/* Document ID Input */}
            <div className="max-w-md">
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Document ID (from scraping results)
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="e.g., doc_1762627721"
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat History
            </h4>
            <button
              onClick={clearChat}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Chat
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                  
                  {/* Show references for AI messages */}
                  {message.type === 'ai' && message.references && message.references.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">References:</p>
                      <div className="space-y-1">
                        {message.references.slice(0, 3).map((ref, index) => (
                          <a
                            key={index}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-blue-600 hover:text-blue-800 truncate"
                          >
                            {ref}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Chat Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Question Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ask a Legal Question
        </label>
        <div className="flex gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What are the key provisions for maritime security cooperation?"
            rows={3}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !question.trim() || !documentId.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending...' : 'Ask AI'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Ctrl+Enter to send quickly
        </p>
      </div>

      {/* Suggested Questions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Questions</h4>
        <div className="grid gap-3 md:grid-cols-2">
          {suggestedQuestions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(item.text)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {item.category}
                </span>
              </div>
              <p className="text-sm text-gray-900 group-hover:text-purple-600">
                {item.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Results</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure to enter a valid document ID from your scraping results</li>
          <li>• Ask specific questions about the document content</li>
          <li>• Reference specific sections, articles, or provisions when possible</li>
          <li>• Use follow-up questions to dive deeper into topics</li>
        </ul>
      </div>
    </div>
  );
}