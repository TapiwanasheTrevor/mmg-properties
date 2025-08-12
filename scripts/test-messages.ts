// Simple test script to verify messaging functionality
import { messageService } from '../lib/services/message-service';

async function testMessaging() {
  console.log('🧪 Testing messaging functionality...');

  try {
    // Test creating a conversation
    console.log('1. Creating test conversation...');
    const conversationId = await messageService.createConversation(
      'Test Conversation',
      'direct',
      ['test-user-1', 'test-user-2'],
      'test-user-1',
      {
        description: 'Testing message functionality',
        propertyId: 'test-property',
        propertyName: 'Test Property'
      }
    );
    console.log(`✅ Conversation created: ${conversationId}`);

    // Test sending a message
    console.log('2. Sending test message...');
    const messageId = await messageService.sendMessage(
      conversationId,
      'Hello! This is a test message.',
      'test-user-1',
      'Test User 1',
      'tenant',
      {
        type: 'direct',
        priority: 'medium'
      }
    );
    console.log(`✅ Message sent: ${messageId}`);

    console.log('🎉 All tests passed! Messaging system is working.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Only run if called directly
if (require.main === module) {
  testMessaging();
}

export { testMessaging };