// Test file to verify API connection
import axios from 'axios';

const testConnection = async () => {
  try {
    console.log('Testing direct API connection...');
    const response = await axios.get('http://localhost:3000/api/products/available');
    console.log('✅ Direct axios call SUCCESS:', response.data.length, 'products');
    return response.data;
  } catch (error) {
    console.error('❌ Direct axios call FAILED:', error);
    throw error;
  }
};

// Execute test
testConnection();

export { testConnection };
