// Test API endpoints
const testAPI = async () => {
  try {
    console.log('Testing API endpoints...');
    
    // Test products endpoint
    const productsResponse = await fetch('http://127.0.0.1:5000/api/products');
    console.log('Products endpoint status:', productsResponse.status);
    const productsData = await productsResponse.json();
    console.log('Products data:', productsData);
    
    // Test remedies endpoint
    const remediesResponse = await fetch('http://127.0.0.1:5000/api/remedies');
    console.log('Remedies endpoint status:', remediesResponse.status);
    const remediesData = await remediesResponse.json();
    console.log('Remedies data:', remediesData);
    
    // Test categories endpoint
    const categoriesResponse = await fetch('http://127.0.0.1:5000/api/categories');
    console.log('Categories endpoint status:', categoriesResponse.status);
    const categoriesData = await categoriesResponse.json();
    console.log('Categories data:', categoriesData);
    
  } catch (error) {
    console.error('API test error:', error);
  }
};

testAPI();