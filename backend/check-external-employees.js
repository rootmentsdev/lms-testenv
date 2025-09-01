import axios from 'axios';

async function checkExternalEmployees() {
    try {
        console.log('=== CHECKING EXTERNAL EMPLOYEE DATA ===');
        
        // Simulate the same API call that getTopUsers makes
        const response = await axios.post('http://localhost:7000/api/employee_range', {
            startEmpId: 'EMP1',
            endEmpId: 'EMP9999'
        }, { timeout: 15000 });
        
        const externalEmployees = response.data?.data || [];
        console.log(`Total external employees fetched: ${externalEmployees.length}`);
        
        // Look for the specific employees shown in your frontend
        const targetNames = [
            'MUHAMMED JABIR',
            'JYOTHISH', 
            'KARTHIK MADHUSOODHANAN P V'
        ];
        
        console.log('\n=== SEARCHING FOR TARGET EMPLOYEES ===');
        const foundEmployees = [];
        
        externalEmployees.forEach((emp, index) => {
            if (targetNames.includes(emp.name)) {
                foundEmployees.push(emp);
                console.log(`\n✅ Found: ${emp.name}`);
                console.log(`  Store Code: ${emp.store_code}`);
                console.log(`  Store Name: ${emp.store_name}`);
                console.log(`  Role: ${emp.role_name}`);
                console.log(`  Email: ${emp.email}`);
                console.log(`  Index in array: ${index}`);
            }
        });
        
        if (foundEmployees.length === 0) {
            console.log('\n❌ None of the target employees found in external data!');
            console.log('This suggests there might be a data mismatch or the names are different.');
            
            // Show some sample external employees to understand the data structure
            console.log('\n=== SAMPLE EXTERNAL EMPLOYEES ===');
            const sampleEmployees = externalEmployees.slice(0, 5);
            sampleEmployees.forEach((emp, index) => {
                console.log(`${index + 1}. ${emp.name} - ${emp.store_name} (${emp.store_code})`);
            });
        } else {
            console.log(`\n✅ Found ${foundEmployees.length} target employees in external data`);
        }
        
        // Check if there are any employees with similar names
        console.log('\n=== CHECKING FOR SIMILAR NAMES ===');
        const similarNames = externalEmployees.filter(emp => {
            const empName = emp.name?.toLowerCase() || '';
            return targetNames.some(targetName => 
                empName.includes(targetName.toLowerCase()) || 
                targetName.toLowerCase().includes(empName)
            );
        });
        
        if (similarNames.length > 0) {
            console.log('Found employees with similar names:');
            similarNames.forEach(emp => {
                console.log(`  - ${emp.name} (${emp.store_name})`);
            });
        }
        
        // Check the data structure
        if (externalEmployees.length > 0) {
            console.log('\n=== EXTERNAL EMPLOYEE DATA STRUCTURE ===');
            const sample = externalEmployees[0];
            console.log('Sample employee object keys:', Object.keys(sample));
            console.log('Sample employee data:', JSON.stringify(sample, null, 2));
        }
        
    } catch (error) {
        console.error('Error checking external employees:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the check
checkExternalEmployees();
