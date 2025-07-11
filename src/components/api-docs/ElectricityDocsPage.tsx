import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Zap,
  AlertCircle
} from 'lucide-react';

export function ElectricityDocsPage() {
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
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Electricity API</h1>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-800 mb-3">Electricity Service Overview</h3>
          <p className="text-yellow-700 mb-4">
            The Electricity API allows you to programmatically pay electricity bills for all major Nigerian electricity distribution companies (DisCos).
          </p>
          <div className="flex items-start space-x-2 text-yellow-700">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <p>
              Electricity transactions require customer verification before purchase. You must verify the meter number to get customer details and ensure the meter is valid.
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Providers</h2>
          <p className="text-gray-700">
            You can retrieve the list of available electricity providers using the <code>GET /api/services</code> endpoint with the <code>x-api-key</code> header. Filter the response for providers with <code>type: "electricity"</code>.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Provider Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services response (filtered for electricity providers)
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Ikeja Electric",
    "type": "electricity",
    "code": "ikeja-electric",
    "logo_url": "https://example.com/logos/ikeja.png",
    "status": "active",
    "commission_rate": 1.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "name": "Eko Electric",
    "type": "electricity",
    "code": "eko-electric",
    "logo_url": "https://example.com/logos/eko.png",
    "status": "active",
    "commission_rate": 0.8,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "c3d4e5f6-g7h8-9012-cdef-g12345678901",
    "name": "Kano Electricity",
    "type": "electricity",
    "code": "kano-electric",
    "logo_url": "https://example.com/logos/kano.png",
    "status": "active",
    "commission_rate": 1.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  // ... other electricity providers
]`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>code</code> field is what you'll use as the <code>provider</code> parameter in your purchase request.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Verify Meter</h2>
          <p className="text-gray-700">
            Before purchasing electricity, you should verify the meter number to get customer details and ensure the meter is valid.
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
  "serviceId": "ikeja-electric",
  "customerId": "1234567890",
  "type": "prepaid"
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
  "serviceId": "ikeja-electric",
  "customerId": "1234567890",
  "type": "prepaid"
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
                    <td className="px-4 py-2">Provider code (e.g., "ikeja-electric", "eko-electric")</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">customerId</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Meter number</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">type</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Meter type: "prepaid" or "postpaid"</td>
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
  "Address": "123 Main Street, Lagos, Nigeria",
  "Meter_Number": "1234567890",
  "Meter_Type": "PREPAID",
  "Customer_District": "Ikeja",
  "Business_Unit": "Ikeja Electric",
  "Minimum_Amount": 1000,
  "Can_Vend": "true"
}`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>Minimum_Amount</code> field indicates the minimum amount that can be purchased for this meter.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Purchase Electricity</h2>
          
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
  "type": "electricity",
  "amount": 2000,
  "recipient": "08012345678",
  "provider": "ikeja-electric",
  "variation_code": "prepaid",
  "biller_code": "1234567890"
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
  "type": "electricity",
  "amount": 2000,
  "recipient": "08012345678",
  "provider": "ikeja-electric",
  "variation_code": "prepaid",
  "biller_code": "1234567890"
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
                    <td className="px-4 py-2">Must be "electricity" for electricity bill payments</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">amount</td>
                    <td className="px-4 py-2">number</td>
                    <td className="px-4 py-2">Yes</td>
                     <td className="px-4 py-2">{'Amount in NGN (must be >= minimum amount from verification)'}</td>
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
                    <td className="px-4 py-2">Provider code (e.g., "ikeja-electric", "eko-electric")</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">variation_code</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Meter type: "prepaid" or "postpaid"</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">biller_code</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Meter number</td>
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
  "message": "Electricity purchase processed successfully",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "external_reference": "202407121234ABCDEF",
    "status": "pending", // Initially "pending", check status endpoint for updates
    "type": "electricity",
    "amount": 2000,
    "user_discount": 20, // Discount applied (based on provider's commission_rate)
    "total_amount": 1980, // Actual amount deducted from wallet
    "recipient": "08012345678",
    "provider": "ikeja-electric",
    "variation_code": "prepaid",
    "biller_code": "1234567890",
    "purchased_code": "1234-5678-9012-3456", // Token for prepaid meters
    "description": "Electricity purchase for 1234567890",
    "created_at": "2024-07-12T12:34:56.789Z",
    "updated_at": "2024-07-12T12:34:56.789Z"
  }
}`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              For prepaid meters, the <code>purchased_code</code> field contains the token that the customer can use to load units on their meter.
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

async function verifyMeter(serviceId, meterNumber, meterType) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/verify-customer\`,
      {
        serviceId,
        customerId: meterNumber,
        type: meterType
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Meter verification:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying meter:', error.response?.data || error.message);
    throw error;
  }
}

async function purchaseElectricity(phoneNumber, provider, meterNumber, meterType, amount) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'electricity',
        amount,
        recipient: phoneNumber,
        provider,
        variation_code: meterType,
        biller_code: meterNumber
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
    console.error('Error purchasing electricity:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Verify meter
    const meterNumber = '1234567890';
    const meterType = 'prepaid';
    const provider = 'ikeja-electric';
    
    const meterInfo = await verifyMeter(provider, meterNumber, meterType);
    
    // Check if meter is valid and can vend
    if (meterInfo.Can_Vend !== 'true') {
      console.error('Cannot vend to this meter');
      return;
    }
    
    // Get minimum amount
    const minAmount = parseFloat(meterInfo.Minimum_Amount) || 1000;
    const amount = Math.max(2000, minAmount); // Use at least 2000 or the minimum amount
    
    // Purchase electricity
    const transaction = await purchaseElectricity(
      '08012345678',
      provider,
      meterNumber,
      meterType,
      amount
    );
    
    console.log('Electricity purchase initiated:', transaction);
    
    // If transaction is successful and has a token
    if (transaction.transaction.purchased_code) {
      console.log('Electricity token:', transaction.transaction.purchased_code);
    }
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
            <Link to="/api-docs/tv" className="text-blue-600 hover:text-blue-700">
              ← Previous: TV API
            </Link>
            <Link to="/api-docs/education" className="text-blue-600 hover:text-blue-700">
              Next: Education API →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}