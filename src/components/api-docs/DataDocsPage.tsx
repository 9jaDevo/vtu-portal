import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Wifi,
  AlertCircle
} from 'lucide-react';

export function DataDocsPage() {
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
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Data API</h1>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-3">Data Service Overview</h3>
          <p className="text-green-700 mb-4">
            The Data API allows you to programmatically purchase data bundles for all major Nigerian mobile networks including MTN, Airtel, Glo, 9mobile, Smile, and Spectranet.
          </p>
          <div className="flex items-start space-x-2 text-green-700">
            <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <p>
              Data transactions require both a provider and a specific variation code (plan). You must first fetch available plans for a provider before making a purchase.
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Providers</h2>
          <p className="text-gray-700">
            You can retrieve the list of available data providers using the <code>GET /api/services</code> endpoint with the <code>x-api-key</code> header. Filter the response for providers with <code>type: "data"</code>.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Provider Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services response (filtered for data providers)
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "MTN Data",
    "type": "data",
    "code": "mtn-data",
    "logo_url": "https://example.com/logos/mtn.png",
    "status": "active",
    "commission_rate": 3.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "name": "Airtel Data",
    "type": "data",
    "code": "airtel-data",
    "logo_url": "https://example.com/logos/airtel.png",
    "status": "active",
    "commission_rate": 3.4,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "c3d4e5f6-g7h8-9012-cdef-g12345678901",
    "name": "Glo Data",
    "type": "data",
    "code": "glo-data",
    "logo_url": "https://example.com/logos/glo.png",
    "status": "active",
    "commission_rate": 4.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "d4e5f6g7-h8i9-0123-defg-h12345678901",
    "name": "9mobile Data",
    "type": "data",
    "code": "etisalat-data",
    "logo_url": "https://example.com/logos/9mobile.png",
    "status": "active",
    "commission_rate": 4.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "e5f6g7h8-i9j0-1234-efgh-i12345678901",
    "name": "Smile Network",
    "type": "data",
    "code": "smile-direct",
    "logo_url": "https://example.com/logos/smile.png",
    "status": "active",
    "commission_rate": 5.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "f6g7h8i9-j0k1-2345-fghi-j12345678901",
    "name": "Spectranet",
    "type": "data",
    "code": "spectranet",
    "logo_url": "https://example.com/logos/spectranet.png",
    "status": "active",
    "commission_rate": 5.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "g7h8i9j0-k1l2-3456-ghij-k12345678901",
    "name": "GLO SME Data",
    "type": "data",
    "code": "glo-sme-data",
    "logo_url": "https://example.com/logos/glo.png",
    "status": "active",
    "commission_rate": 4.0,
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
          <h2 className="text-2xl font-semibold text-gray-900">Available Data Plans</h2>
          <p className="text-gray-700">
            After selecting a provider, you need to fetch the available data plans for that provider using the <code>GET /api/services/:provider_id/plans</code> endpoint.
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
{`// GET /api/services/:provider_id/plans response (for MTN Data)
[
  {
    "id": "h8i9j0k1-l2m3-4567-hijk-l12345678901",
    "name": "N100 100MB - 24 hrs",
    "code": "mtn-10mb-100",
    "amount": 100,
    "validity": "24 hours",
    "description": "MTN 100MB data bundle",
    "status": "active"
  },
  {
    "id": "i9j0k1l2-m3n4-5678-ijkl-m12345678901",
    "name": "N200 200MB - 2 days",
    "code": "mtn-50mb-200",
    "amount": 200,
    "validity": "2 days",
    "description": "MTN 200MB data bundle",
    "status": "active"
  },
  {
    "id": "j0k1l2m3-n4o5-6789-jklm-n12345678901",
    "name": "N1000 1.5GB - 30 days",
    "code": "mtn-100mb-1000",
    "amount": 1000,
    "validity": "30 days",
    "description": "MTN 1.5GB data bundle",
    "status": "active"
  },
  {
    "id": "k1l2m3n4-o5p6-7890-klmn-o12345678901",
    "name": "N2000 4.5GB - 30 days",
    "code": "mtn-500mb-2000",
    "amount": 2000,
    "validity": "30 days",
    "description": "MTN 4.5GB data bundle",
    "status": "active"
  }
]`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>code</code> field is what you'll use as the <code>variation_code</code> parameter in your purchase request.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Special Case: GLO SME Data</h4>
                <p className="text-yellow-700">
                  For the "glo-sme-data" provider, plans are fetched dynamically from VTPass. Use the <code>GET /api/services/:provider_id/dynamic-plans</code> endpoint instead of the regular plans endpoint.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Purchase Data Bundle</h2>
          
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
  "type": "data",
  "amount": 1000,
  "recipient": "08012345678",
  "provider": "mtn-data",
  "variation_code": "mtn-100mb-1000"
}`, 'dataPurchaseRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'dataPurchaseRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
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
  "type": "data",
  "amount": 1000,
  "recipient": "08012345678",
  "provider": "mtn-data",
  "variation_code": "mtn-100mb-1000"
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
                    <td className="px-4 py-2">Must be "data" for data bundle purchases</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">amount</td>
                    <td className="px-4 py-2">number</td>
                    <td className="px-4 py-2">Yes*</td>
                    <td className="px-4 py-2">Amount in NGN (should match the plan amount). *Optional for glo-sme-data</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">recipient</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Phone number in format: 08012345678, 2348012345678, or +2348012345678</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">provider</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Provider code: "mtn-data", "airtel-data", "glo-data", "etisalat-data", "smile-direct", "spectranet", "glo-sme-data"</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">variation_code</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Plan code from the plans endpoint (e.g., "mtn-100mb-1000")</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">biller_code</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">No</td>
                    <td className="px-4 py-2">Optional for most data providers. If not provided, recipient is used</td>
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
  "message": "Data purchase processed successfully",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "external_reference": "202407121234ABCDEF",
    "status": "pending", // Initially "pending", check status endpoint for updates
    "type": "data",
    "amount": 1000,
    "user_discount": 30, // Discount applied (based on provider's commission_rate)
    "total_amount": 970, // Actual amount deducted from wallet
    "recipient": "08012345678",
    "provider": "mtn-data",
    "variation_code": "mtn-100mb-1000",
    "description": "Data purchase for 08012345678",
    "created_at": "2024-07-12T12:34:56.789Z",
    "updated_at": "2024-07-12T12:34:56.789Z"
  }
}`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Error Responses</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Invalid Variation Code</h4>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
                  <code>
{`// HTTP Status: 400 Bad Request
{
  "error": "Failed to process data purchase",
  "message": "Invalid variation code"
}`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Invalid Phone Number</h4>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
                  <code>
{`// HTTP Status: 400 Bad Request
{
  "error": "Failed to process data purchase",
  "message": "Invalid phone number"
}`}
                  </code>
                </pre>
              </div>
            </div>
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

async function getDataProviders() {
  try {
    const response = await axios.get(
      \`\${BASE_URL}/services\`,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );
    
    // Filter for data providers
    const dataProviders = response.data.filter(provider => provider.type === 'data');
    console.log('Available data providers:', dataProviders);
    return dataProviders;
  } catch (error) {
    console.error('Error fetching providers:', error.response?.data || error.message);
    throw error;
  }
}

async function getDataPlans(providerId) {
  try {
    const response = await axios.get(
      \`\${BASE_URL}/services/\${providerId}/plans\`,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );
    
    console.log('Available data plans:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching plans:', error.response?.data || error.message);
    throw error;
  }
}

async function purchaseData(phoneNumber, providerCode, variationCode, amount) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'data',
        amount,
        recipient: phoneNumber,
        provider: providerCode,
        variation_code: variationCode
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
    console.error('Error purchasing data:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Get data providers
    const providers = await getDataProviders();
    const mtnData = providers.find(p => p.code === 'mtn-data');
    
    if (!mtnData) {
      console.error('MTN Data provider not found');
      return;
    }
    
    // Get data plans for MTN
    const plans = await getDataPlans(mtnData.id);
    const plan1GB = plans.find(p => p.name.includes('1.5GB'));
    
    if (!plan1GB) {
      console.error('1.5GB plan not found');
      return;
    }
    
    // Purchase data
    const transaction = await purchaseData('08012345678', mtnData.code, plan1GB.code, plan1GB.amount);
    console.log('Data purchase initiated:', transaction);
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
            <Link to="/api-docs/airtime" className="text-blue-600 hover:text-blue-700">
              ← Previous: Airtime API
            </Link>
            <Link to="/api-docs/tv" className="text-blue-600 hover:text-blue-700">
              Next: TV API →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}