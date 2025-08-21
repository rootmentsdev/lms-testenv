import { useState } from 'react';
import baseUrl from '../api/api';

const APITest = () => {
    const [empID, setEmpID] = useState('EMP001');
    const [trainingResult, setTrainingResult] = useState(null);
    const [assessmentResult, setAssessmentResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testTrainingAPI = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${baseUrl.baseUrl}api/user/getAll/training?empID=${empID}`);
            const data = await response.json();
            
            if (response.ok) {
                setTrainingResult(data);
                console.log('✅ Training API Success:', data);
            } else {
                setError(`Training API Error: ${data.message || response.statusText}`);
                console.error('❌ Training API Error:', data);
            }
        } catch (err) {
            setError(`Training API Failed: ${err.message}`);
            console.error('❌ Training API Exception:', err);
        } finally {
            setLoading(false);
        }
    };

    const testAssessmentAPI = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${baseUrl.baseUrl}api/user/getAll/assessment?empID=${empID}`);
            const data = await response.json();
            
            if (response.ok) {
                setAssessmentResult(data);
                console.log('✅ Assessment API Success:', data);
            } else {
                setError(`Assessment API Error: ${data.message || response.statusText}`);
                console.error('❌ Assessment API Error:', data);
            }
        } catch (err) {
            setError(`Assessment API Failed: ${err.message}`);
            console.error('❌ Assessment API Exception:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setTrainingResult(null);
        setAssessmentResult(null);
        setError(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">🔧 API Testing Tool</h1>
            
            {/* Input Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium mb-2">
                    Employee ID to Test:
                </label>
                <input
                    type="text"
                    value={empID}
                    onChange={(e) => setEmpID(e.target.value)}
                    placeholder="Enter Employee ID (e.g., EMP001)"
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            {/* Test Buttons */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={testTrainingAPI}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Testing...' : '🧪 Test Training API'}
                </button>
                
                <button
                    onClick={testAssessmentAPI}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Testing...' : '🧪 Test Assessment API'}
                </button>
                
                <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                    🗑️ Clear Results
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-semibold">❌ Error:</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Results Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Training Results */}
                <div className="border border-gray-200 rounded-lg">
                    <h3 className="p-4 bg-blue-50 border-b border-gray-200 font-semibold">
                        📚 Training API Results
                    </h3>
                    <div className="p-4">
                        {trainingResult ? (
                            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-96">
                                {JSON.stringify(trainingResult, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-gray-500">No training data yet. Click "Test Training API" to test.</p>
                        )}
                    </div>
                </div>

                {/* Assessment Results */}
                <div className="border border-gray-200 rounded-lg">
                    <h3 className="p-4 bg-green-50 border-b border-gray-200 font-semibold">
                        📝 Assessment API Results
                    </h3>
                    <div className="p-4">
                        {assessmentResult ? (
                            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-96">
                                {JSON.stringify(assessmentResult, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-gray-500">No assessment data yet. Click "Test Assessment API" to test.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📋 How to Use:</h3>
                <ol className="list-decimal list-inside text-blue-700 space-y-1">
                    <li>Make sure your backend server is running</li>
                    <li>Enter a valid Employee ID (e.g., EMP001)</li>
                    <li>Click the test buttons to test each API</li>
                    <li>Check the console for detailed logs</li>
                    <li>Results will show below each section</li>
                </ol>
            </div>
        </div>
    );
};

export default APITest;
