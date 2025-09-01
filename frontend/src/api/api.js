  
const baseUrl = {
	// Auto-select base URL depending on environment and window location
	baseUrl: (typeof window !== 'undefined' && window.location.hostname === 'localhost')
		? 'http://localhost:7000/'
		: 'https://lms-testenv.onrender.com/'
}; 

export default baseUrl;


