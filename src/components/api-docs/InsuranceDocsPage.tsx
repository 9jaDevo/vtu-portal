import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Shield,
  AlertCircle
} from 'lucide-react';

export function InsuranceDocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/api-docs" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to API Docs
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Insurance API</h1>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-lg font-medium text-red-800 mb-3">Insurance Service Overview</h3>
          <p className="text-red-700 mb-4">
            The Insurance API allows you to programmatically purchase third-party vehicle insurance for various vehicle types including private vehicles, commercial vehicles, tricycles, and motorcycles.
          </p>
          <div className="flex items-start space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p>
              Insurance transactions require detailed vehicle information. This API endpoint requires more parameters than other services.
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Providers</h2>
          <p className="text-gray-700">
            You can retrieve the list of available insurance providers using the <code>GET /api/services</code> endpoint with the <code>x-api-key</code> header. Filter the response for providers with <code>type: "insurance"</code>.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Provider Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services response (filtered for insurance providers)
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Universal Insurance",
    "type": "insurance",
    "code": "ui-insure",
    "logo_url": "https://example.com/logos/ui-insure.png",
    "status": "active",
    "commission_rate": 6.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  }
]`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>code</code> field is what you'll use as the <code>provider</code> parameter in your purchase request.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Insurance Plans</h2>
          <p className="text-gray-700">
            After selecting a provider, you need to fetch the available insurance plans for that provider using the <code>GET /api/services/:provider_id/plans</code> endpoint.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Request</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/services/a1b2c3d4-e5f6-7890-abcd-ef1234567890/plans

Headers:
  x-api-key: <YOUR_API_KEY>`, 'plansRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'plansRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>GET /api/services/:provider_id/plans</code>
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GET</span>
            </div>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Plans Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services/:provider_id/plans response (for Universal Insurance)
[
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "name": "Private Vehicle Insurance",
    "code": "1",
    "amount": 3000,
    "validity": "365 days",
    "description": "Third party motor insurance for private vehicles",
    "status": "active"
  },
  {
    "id": "c3d4e5f6-g7h8-9012-cdef-g12345678901",
    "name": "Commercial Vehicle Insurance",
    "code": "2",
    "amount": 5000,
    "validity": "365 days",
    "description": "Third party motor insurance for commercial vehicles",
    "status": "active"
  },
  {
    "id": "d4e5f6g7-h8i9-0123-defg-h12345678901",
    "name": "Tricycle Insurance",
    "code": "3",
    "amount": 1500,
    "validity": "365 days",
    "description": "Third party motor insurance for tricycles",
    "status": "active"
  },
  {
    "id": "e5f6g7h8-i9j0-1234-efgh-i12345678901",
    "name": "Motorcycle Insurance",
    "code": "4",
    "amount": 3000,
    "validity": "365 days",
    "description": "Third party motor insurance for motorcycles",
    "status": "active"
  }
]`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>code</code> field is what you'll use as the <code>variation_code</code> parameter in your purchase request.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Auxiliary Data for Insurance</h2>
          <p className="text-gray-700">
            Insurance transactions require additional data such as vehicle colors, engine capacities, states, LGAs, vehicle makes, and vehicle models. You can fetch these using the following endpoints.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Available Auxiliary Data Endpoints</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Endpoint</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium">GET /api/transactions/insurance/vehicle-colors</td>
                  <td className="px-4 py-2">GET</td>
                  <td className="px-4 py-2">Get available vehicle colors</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">GET /api/transactions/insurance/engine-capacities</td>
                  <td className="px-4 py-2">GET</td>
                  <td className="px-4 py-2">Get available engine capacities</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">GET /api/transactions/insurance/states</td>
                  <td className="px-4 py-2">GET</td>
                  <td className="px-4 py-2">Get available states</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">GET /api/transactions/insurance/lgas/:stateCode</td>
                  <td className="px-4 py-2">GET</td>
                  <td className="px-4 py-2">Get LGAs for a specific state</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">GET /api/transactions/insurance/vehicle-makes</td>
                  <td className="px-4 py-2">GET</td>
                  <td className="px-4 py-2">Get available vehicle makes</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">GET /api/transactions/insurance/vehicle-models/:vehicleMakeCode</td>
                  <td className="px-4 py-2">GET</td>
                  <td className="px-4 py-2">Get vehicle models for a specific make</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Auxiliary Data Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/transactions/insurance/vehicle-colors response
[
  {
    "ColourCode": "1",
    "ColourName": "Black"
  },
  {
    "ColourCode": "2",
    "ColourName": "White"
  },
  {
    "ColourCode": "3",
    "ColourName": "Red"
  },
  {
    "ColourCode": "4",
    "ColourName": "Blue"
  },
  {
    "ColourCode": "5",
    "ColourName": "Silver"
  }
]`}
              </code>
            </pre>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Purchase Insurance</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Request</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/purchase

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "insurance",
  "amount": 3000,
  "recipient": "08012345678",
  "provider": "ui-insure",
  "variation_code": "1",
  "biller_code": "ABC123XYZ",
  "Insured_Name": "John Doe",
  "engine_capacity": "1",
  "Chasis_Number": "ABCD1234567890",
  "Plate_Number": "ABC123XYZ",
  "vehicle_make": "1",
  "vehicle_color": "1",
  "vehicle_model": "1",
  "YearofMake": "2020",
  "state": "1",
  "lga": "1",
  "email": "john.doe@example.com"
}`, 'purchaseRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'purchaseRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/purchase</code>
              </p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">POST</span>
            </div>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "insurance",
  "amount": 3000,
  "recipient": "08012345678",
  "provider": "ui-insure",
  "variation_code": "1",
  "biller_code": "ABC123XYZ",
  "Insured_Name": "John Doe",
  "engine_capacity": "1",
  "Chasis_Number": "ABCD1234567890",
  "Plate_Number": "ABC123XYZ",
  "vehicle_make": "1",
  "vehicle_color": "1",
  "vehicle_model": "1",
  "YearofMake": "2020",
  "state": "1",
  "lga": "1",
  "email": "john.doe@example.com"
}`}
              </code>
            </pre>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-2">Parameters Explained</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Parameter</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Required</th>
                    <th className="px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 font-medium">type</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Must be "insurance" for insurance purchases</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">amount</td>
                    <td className="px-4 py-2">number</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Amount in NGN (should match the plan amount)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">recipient</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Phone number of the customer</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">provider</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Provider code (e.g., "ui-insure")</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">variation_code</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Vehicle type: "1" (Private), "2" (Commercial), "3" (Tricycle), "4" (Motorcycle)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">biller_code</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Plate number of the vehicle</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Insured_Name</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Name of the insured person</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">engine_capacity</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Engine capacity code from the engine-capacities endpoint</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Chasis_Number</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Chassis number of the vehicle</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Plate_Number</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Plate number of the vehicle (same as biller_code)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">vehicle_make</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Vehicle make code from the vehicle-makes endpoint</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">vehicle_color</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Vehicle color code from the vehicle-colors endpoint</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">vehicle_model</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Vehicle model code from the vehicle-models endpoint</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">YearofMake</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Year the vehicle was manufactured (e.g., "2020")</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">state</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">State code from the states endpoint</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">lga</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">LGA code from the lgas endpoint</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">email</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Email address of the insured person</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Success Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// HTTP Status: 201 Created
{
  "message": "Insurance purchase processed successfully",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "external_reference": "202407121234ABCDEF",
    "status": "pending", // Initially "pending", check status endpoint for updates
    "type": "insurance",
    "amount": 3000,
    "user_discount": 180, // Discount applied (based on provider's commission_rate)
    "total_amount": 2820, // Actual amount deducted from wallet
    "recipient": "08012345678",
    "provider": "ui-insure",
    "variation_code": "1",
    "biller_code": "ABC123XYZ",
    "purchased_code": "INS-1234-5678-9012", // Insurance policy number
    "description": "Insurance purchase for ABC123XYZ",
    "created_at": "2024-07-12T12:34:56.789Z",
    "updated_at": "2024-07-12T12:34:56.789Z"
  }
}`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>purchased_code</code> field contains the insurance policy number.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Implementation Examples</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">JavaScript/Node.js Example</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'http://localhost:3001/api'; // Change to your production URL

async function getInsuranceAuxiliaryData() {
  try {
    // Fetch all auxiliary data in parallel
    const [
      colorsResponse,
      capacitiesResponse,
      statesResponse,
      makesResponse
    ] = await Promise.all([
      axios.get(\`\${BASE_URL}/transactions/insurance/vehicle-colors\`, {
        headers: { 'x-api-key': API_KEY }
      }),
      axios.get(\`\${BASE_URL}/transactions/insurance/engine-capacities\`, {
        headers: { 'x-api-key': API_KEY }
      }),
      axios.get(\`\${BASE_URL}/transactions/insurance/states\`, {
        headers: { 'x-api-key': API_KEY }
      }),
      axios.get(\`\${BASE_URL}/transactions/insurance/vehicle-makes\`, {
        headers: { 'x-api-key': API_KEY }
      })
    ]);
    
    // Get a specific state's LGAs
    const stateCode = statesResponse.data[0].StateCode;
    const lgasResponse = await axios.get(
      \`\${BASE_URL}/transactions/insurance/lgas/\${stateCode}\`,
      { headers: { 'x-api-key': API_KEY } }
    );
    
    // Get a specific make's models
    const makeCode = makesResponse.data[0].VehicleMakeCode;
    const modelsResponse = await axios.get(
      \`\${BASE_URL}/transactions/insurance/vehicle-models/\${makeCode}\`,
      { headers: { 'x-api-key': API_KEY } }
    );
    
    return {
      colors: colorsResponse.data,
      capacities: capacitiesResponse.data,
      states: statesResponse.data,
      lgas: lgasResponse.data,
      makes: makesResponse.data,
      models: modelsResponse.data
    };
  } catch (error) {
    console.error('Error fetching insurance auxiliary data:', error.response?.data || error.message);
    throw error;
  }
}

async function purchaseInsurance(insuranceData) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'insurance',
        ...insuranceData
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Transaction initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error purchasing insurance:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Get auxiliary data
    const auxiliaryData = await getInsuranceAuxiliaryData();
    console.log('Auxiliary data fetched successfully');
    
    // Get insurance providers
    const services = await axios.get(
      \`\${BASE_URL}/services\`,
      { headers: { 'x-api-key': API_KEY } }
    );
    
    const insuranceProvider = services.data.find(p => p.type === 'insurance');
    
    if (!insuranceProvider) {
      console.error('Insurance provider not found');
      return;
    }
    
    // Get insurance plans
    const plans = await axios.get(
      \`\${BASE_URL}/services/\${insuranceProvider.id}/plans\`,
      { headers: { 'x-api-key': API_KEY } }
    );
    
    const privateVehiclePlan = plans.data.find(p => p.name.includes('Private Vehicle'));
    
    if (!privateVehiclePlan) {
      console.error('Private vehicle plan not found');
      return;
    }
    
    // Purchase insurance
    const transaction = await purchaseInsurance({
      amount: privateVehiclePlan.amount,
      recipient: '08012345678',
      provider: insuranceProvider.code,
      variation_code: privateVehiclePlan.code,
      biller_code: 'ABC123XYZ',
      Insured_Name: 'John Doe',
      engine_capacity: auxiliaryData.capacities[0].CapacityCode,
      Chasis_Number: 'ABCD1234567890',
      Plate_Number: 'ABC123XYZ',
      vehicle_make: auxiliaryData.makes[0].VehicleMakeCode,
      vehicle_color: auxiliaryData.colors[0].ColourCode,
      vehicle_model: auxiliaryData.models[0].VehicleModelCode,
      YearofMake: '2020',
      state: auxiliaryData.states[0].StateCode,
      lga: auxiliaryData.lgas[0].LGACode,
      email: 'john.doe@example.com'
    });
    
    console.log('Insurance purchase initiated:', transaction);
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

main();`}
              </code>
            </pre>
          </div>
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex justify-between">
            <Link to="/api-docs/education" className="text-blue-600 hover:text-blue-700">
              ← Previous: Education API
            </Link>
            <Link to="/api-docs" className="text-blue-600 hover:text-blue-700">
              Back to API Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}