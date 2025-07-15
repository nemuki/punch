import { validateLocalStorage } from './src/utils/local-storage-validator.ts';
import { applicationConstants } from './src/utils/constant.ts';

// Test data - missing version
const oldVersionData = {
  conversations: [{
    id: 'test-id-1',
    channelId: 'C1234567890',
    searchMessage: 'テスト検索メッセージ'
  }, {
    id: 'test-id-2', 
    channelId: 'C0987654321',
    searchMessage: '別のテスト検索メッセージ'
  }],
  status: {
    emoji: {
      office: ':office:',
      telework: ':house_with_garden:',
      leave: ':soon:'
    },
    text: {
      office: '出社しています',
      telework: 'テレワーク',
      leave: '退勤しています'
    }
  },
  messages: {
    office: {
      start: '業務開始します',
      end: '業務終了します'
    },
    telework: {
      start: 'テレワーク開始します',
      end: 'テレワーク終了します'
    }
  }
};

// Test data - wrong version
const wrongVersionData = {
  version: 999,
  ...oldVersionData
};

// Test data - valid current version
const validData = {
  version: 1,
  ...oldVersionData
};

console.log('Testing localStorage validation...\n');

// Test 1: Missing version
console.log('Test 1: Missing version');
const result1 = validateLocalStorage(oldVersionData);
console.log('Result:', result1);
console.log('Expected: isValid=false, reason=missing-version');
console.log('✓ Test 1:', !result1.isValid && result1.reason === 'missing-version' ? 'PASS' : 'FAIL');
console.log();

// Test 2: Wrong version
console.log('Test 2: Wrong version');
const result2 = validateLocalStorage(wrongVersionData);
console.log('Result:', result2);
console.log('Expected: isValid=false, reason=version-mismatch');
console.log('✓ Test 2:', !result2.isValid && result2.reason === 'version-mismatch' ? 'PASS' : 'FAIL');
console.log();

// Test 3: Valid version
console.log('Test 3: Valid version');
const result3 = validateLocalStorage(validData);
console.log('Result:', result3);
console.log('Expected: isValid=true');
console.log('✓ Test 3:', result3.isValid ? 'PASS' : 'FAIL');
console.log();

// Test what the current default version is
console.log('Current default version:', applicationConstants.defaultAppSettings.version);
console.log();

// Show what data would be displayed in error cases
if (!result1.isValid) {
  console.log('Error data for missing version test:');
  console.log('- Reason:', result1.reason);
  console.log('- Expected version:', result1.expectedVersion);
  console.log('- Actual version:', result1.actualVersion);
  console.log('- Channel IDs:', result1.currentData.conversations?.map(c => c.channelId));
  console.log('- Search messages:', result1.currentData.conversations?.map(c => c.searchMessage));
  console.log();
}

if (!result2.isValid) {
  console.log('Error data for wrong version test:');
  console.log('- Reason:', result2.reason);
  console.log('- Expected version:', result2.expectedVersion);
  console.log('- Actual version:', result2.actualVersion);
  console.log('- Channel IDs:', result2.currentData.conversations?.map(c => c.channelId));
  console.log('- Search messages:', result2.currentData.conversations?.map(c => c.searchMessage));
  console.log();
}

console.log('All tests completed!');