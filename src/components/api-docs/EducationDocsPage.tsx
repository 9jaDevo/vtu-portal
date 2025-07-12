import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  GraduationCap,
  AlertCircle
} from 'lucide-react';

export function EducationDocsPage() {
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
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Education API</h1>
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-medium text-indigo-800 mb-3">Education Service Overview</h3>
          <p className="text-indigo-700 mb-4">
            The Education API allows you to programmatically purchase educational services such as WAEC, JAMB, and NECO registration and result checking.
          </p>
          <div className="flex items-start space-x-2 text-indigo-700">
            <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
            <p>
              JAMB transactions require profile ID verification before purchase. For other education services, verification is not required.
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Providers</h2>
          <p className="text-gray-700">
            You can retrieve the list of available education providers using the <code>GET /api/services</code> endpoint with the <code>x-api-key</code> header. Filter the response for providers with <code>type: "education"</code>.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Provider Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services response (filtered for education providers)
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "WAEC Registration",
    "type": "education",
    "code": "waec-registration",
    "logo_url": "https://example.com/logos/waec.png",
    "status": "active",
    "commission_rate": 0,
    "commission_type": "flat_fee",
    "flat_fee_amount": 150.00,
    "is_enabled": true
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "name": "WAEC Result Checker",
    "type": "education",
    "code": "waec",
    "logo_url": "https://example.com/logos/waec.png",
    "status": "active",
    "commission_rate": 0,
    "commission_type": "flat_fee",
    "flat_fee_amount": 250.00,
    "is_enabled": true
  },
  {
    "id": "c3d4e5f6-g7h8-9012-cdef-g12345678901",
    "name": "JAMB",
    "type": "education",
    "code": "jamb",
    "logo_url": "https://example.com/logos/jamb.png",
    "status": "active",
    "commission_rate": 0,
    "commission_type": "flat_fee",
    "flat_fee_amount": 150.00,
    "is_enabled": true
  },
  {
    "id": "d4e5f6g7-h8i9-0123-defg-h12345678901",
    "name": "NECO",
    "type": "education",
    "code": "neco",
    "logo_url": "https://example.com/logos/neco.png",
    "status": "active",
    "commission_rate": 0,
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
          <h2 className="text-2xl font-semibold text-gray-900">Available Education Plans</h2>
          <p className="text-gray-700">
            After selecting a provider, you need to fetch the available plans for that provider using the <code>GET /api/services/:provider_id/plans</code> endpoint.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Request</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/services/c3d4e5f6-g7h8-9012-cdef-g12345678901/plans

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
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Plans Response (JAMB)</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services/:provider_id/plans response (for JAMB)
[
  {
    "id": "e5f6g7h8-i9j0-1234-efgh-i12345678901",
    "name": "JAMB UTME PIN (with mock)",
    "code": "utme-mock",
    "amount": 7700,
    "validity": null,
    "description": "JAMB UTME PIN with mock examination",
    "status": "active"
  },
  {
    "id": "f6g7h8i9-j0k1-2345-fghi-j12345678901",
    "name": "JAMB UTME PIN (without mock)",
    "code": "utme-no-mock",
    "amount": 6200,
    "validity": null,
    "description": "JAMB UTME PIN without mock examination",
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
          <h2 className="text-2xl font-semibold text-gray-900">Verify JAMB Profile ID</h2>
          <p className="text-gray-700">
            For JAMB services, you should verify the profile ID before purchase.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Request</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/verify-customer

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "serviceId": "jamb",
  "customerId": "1234567890",
  "type": "utme-mock"
}`, 'verifyRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'verifyRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/verify-customer</code>
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
  "serviceId": "jamb",
  "customerId": "1234567890",
  "type": "utme-mock"
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
                    <td className="px-4 py-2 font-medium">serviceId</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Must be "jamb" for JAMB verification</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">customerId</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">JAMB profile ID</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">type</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Variation code: "utme-mock" or "utme-no-mock"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Verification Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// HTTP Status: 200 OK
{
  "Customer_Name": "JOHN DOE",
  "Status": "Valid",
  "Customer_Number": "1234567890"
}`}
              </code>
            </pre>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Purchase Education Service</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">JAMB Purchase Request</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/purchase

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "education",
  "amount": 7700,
  "recipient": "08012345678",
  "provider": "jamb",
  "variation_code": "utme-mock",
  "biller_code": "1234567890"
}`, 'jambPurchaseRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'jambPurchaseRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/purchase</code> (JAMB)
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
  "type": "education",
  "amount": 7700,
  "recipient": "08012345678",
  "provider": "jamb",
  "variation_code": "utme-mock",
  "biller_code": "1234567890"
}`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">WAEC Result Checker Request</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/purchase

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "education",
  "amount": 2500,
  "recipient": "08012345678",
  "provider": "waec",
  "variation_code": "waec-result"
}`, 'waecPurchaseRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'waecPurchaseRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/purchase</code> (WAEC)
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
  "type": "education",
  "amount": 2500,
  "recipient": "08012345678",
  "provider": "waec",
  "variation_code": "waec-result"
}`}
              </code>
            </pre>
          </div>
            
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
                  <td className="px-4 py-2">Must be "education" for education service purchases</td>
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
                  <td className="px-4 py-2">Provider code: "jamb", "waec", "waec-registration", "neco"</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">variation_code</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">Yes</td>
                  <td className="px-4 py-2">Plan code from the plans endpoint (e.g., "utme-mock", "waec-result")</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">biller_code</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">Yes*</td>
                  <td className="px-4 py-2">*Required for JAMB (Profile ID). Optional for other education services</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">quantity</td>
                  <td className="px-4 py-2">number</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Optional. Number of PINs to purchase (default: 1)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Success Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// HTTP Status: 201 Created
{
  "message": "Education service purchase processed successfully",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "external_reference": "202407121234ABCDEF",
    "status": "pending", // Initially "pending", check status endpoint for updates
    "type": "education",
    "amount": 7700,
    "user_discount": 150, // Discount applied (based on provider's flat_fee_amount)
    "total_amount": 7550, // Actual amount deducted from wallet
    "recipient": "08012345678",
    "provider": "jamb",
    "variation_code": "utme-mock",
    "biller_code": "1234567890",
    "purchased_code": "1234-5678-9012-3456", // PIN for the service
    "description": "Education service purchase for JAMB UTME PIN (with mock)",
    "created_at": "2024-07-12T12:34:56.789Z",
    "updated_at": "2024-07-12T12:34:56.789Z"
  }
}`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>purchased_code</code> field contains the PIN that the customer can use for the education service.
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

async function verifyJambProfile(profileId, variationCode) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/verify-customer\`,
      {
        serviceId: 'jamb',
        customerId: profileId,
        type: variationCode
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('JAMB profile verification:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying JAMB profile:', error.response?.data || error.message);
    throw error;
  }
}

async function purchaseJambPin(phoneNumber, profileId, variationCode, amount) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'education',
        amount,
        recipient: phoneNumber,
        provider: 'jamb',
        variation_code: variationCode,
        biller_code: profileId
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
    console.error('Error purchasing JAMB PIN:', error.response?.data || error.message);
    throw error;
  }
}

async function purchaseWaecResult(phoneNumber, amount) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'education',
        amount,
        recipient: phoneNumber,
        provider: 'waec',
        variation_code: 'waec-result'
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
    console.error('Error purchasing WAEC result checker:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Example 1: Purchase JAMB PIN
    const profileId = '1234567890';
    const variationCode = 'utme-mock';
    
    // Verify JAMB profile
    const profileInfo = await verifyJambProfile(profileId, variationCode);
    
    if (profileInfo.Status === 'Valid') {
      // Purchase JAMB PIN
      const jambTransaction = await purchaseJambPin(
        '08012345678',
        profileId,
        variationCode,
        7700 // Amount for UTME with mock
      );
      
      console.log('JAMB PIN purchase:', jambTransaction);
    }
    
    // Example 2: Purchase WAEC Result Checker
    const waecTransaction = await purchaseWaecResult(
      '08012345678',
      2500 // Amount for WAEC result checker
    );
    
    console.log('WAEC result checker purchase:', waecTransaction);
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
            <Link to="/api-docs/electricity" className="text-blue-600 hover:text-blue-700">
              ← Previous: Electricity API
            </Link>
            <Link to="/api-docs/insurance" className="text-blue-600 hover:text-blue-700">
              Next: Insurance API →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}