// Helper function for auto-replies
export function getAutoReply(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('pricing') || lower.includes('price') || lower.includes('cost')) {
    return '💰 You can find our pricing details on our website. Would you like me to connect you with a sales representative?';
  }
  if (lower.includes('feature') || lower.includes('capability')) {
    return '✨ We offer a wide range of features including live chat, ticket management, and team collaboration. What specific features are you interested in?';
  }
  if (lower.includes('support') || lower.includes('help')) {
    return '🆘 I\'m here to help! Our support team is available 24/7. What issue are you experiencing?';
  }
  if (lower.includes('demo') || lower.includes('show')) {
    return '🎯 I\'d be happy to schedule a demo for you. What time works best for you?';
  }
  
  return '👋 Thanks for your message! Our team will get back to you shortly. In the meantime, feel free to ask about pricing, features, or schedule a demo.';
}