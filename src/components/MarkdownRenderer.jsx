import React from 'react';

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Simple markdown parser for basic formatting
  const parseMarkdown = (text) => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      
      // Code blocks and inline code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono text-gray-800">$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')
      
      // Lists
      .replace(/^\* (.*$)/gm, '<li class="text-gray-700 mb-1">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="text-gray-700 mb-1">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="text-gray-700 mb-1">$1</li>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="text-gray-700 mb-4">')
      .replace(/\n/g, '<br/>');
  };

  // Wrap consecutive list items in ul tags
  const wrapLists = (html) => {
    return html
      .replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/g, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
      .replace(/<p class="text-gray-700 mb-4"><\/p>/g, ''); // Remove empty paragraphs
  };

  const processedContent = wrapLists(`<p class="text-gray-700 mb-4">${parseMarkdown(content)}</p>`);

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}