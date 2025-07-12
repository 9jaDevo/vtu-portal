import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Tv,
  AlertCircle
} from 'lucide-react';

export function TvDocsPage() {
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
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Tv className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">TV API</h1>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-medium text-purple-800 mb-3">TV Service Overview</h3>
          <p className="text-purple-700 mb-4">
            The TV API allows you to programmatically purchase or renew TV subscriptions for major providers including DSTV, GOtv, Startimes, and Showmax.
          </p>
          <div className="flex items-start space-x-2 text-purple-700">
            <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
            <p>
              TV transactions require customer verification before purchase. You must verify the customer's smartcard number to get their current subscription details and renewal amount.
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Providers</h2>
          <p className="text-gray-700">
            You can retrieve the list of available TV providers using the <code>GET /api/services</code> endpoint with the <code>x-api-key</code> header. Filter the response for providers with <code>type: "tv"</code>.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Provider Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services response (filtered for TV providers)
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "DSTV",
    "type": "tv",
    "code": "dstv",
    "logo_url": "https://example.com/logos/dstv.png",
    "status": "active",
    "commission_rate": 1.5,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "name": "GOtv",
    "type": "tv",
    "code": "gotv",
    "logo_url": "https://example.com/logos/gotv.png",
    "status": "active",
    "commission_rate": 1.5,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "c3d4e5f6-g7h8-9012-cdef-g12345678901",
    "name": "Startimes",
    "type": "tv",
    "code": "startimes",
    "logo_url": "https://example.com/logos/startimes.png",
    "status": "active",
    "commission_rate": 2.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "d4e5f6g7-h8i9-0123-defg-h12345678901",
    "name": "Showmax",
    "type": "tv",
    "code": "showmax",
    "logo_url": "https://example.com/logos/showmax.png",
    "status": "active",
    "commission_rate": 1.5,
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
          <h2 className="text-2xl font-semibold text-gray-900">Available TV Plans</h2>
          <p className="text-gray-700">
            After selecting a provider, you need to fetch the available TV plans for that provider using the <code>GET /api/services/:provider_id/plans</code> endpoint.
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
{`// GET /api/services/:provider_id/plans response (for DSTV)
[
  {
    "id": "e5f6g7h8-i9j0-1234-efgh-i12345678901",
    "name": "DStv Padi",
    "code": "dstv-padi",
    "amount": 2500,
    "validity": "30 days",
    "description": "DStv Padi bouquet",
    "status": "active"
  },
  {
    "id": "f6g7h8i9-j0k1-2345-fghi-j12345678901",
    "name": "DStv Yanga",
    "code": "dstv-yanga",
    "amount": 3500,
    "validity": "30 days",
    "description": "DStv Yanga bouquet",
    "status": "active"
  },
  {
    "id": "g7h8i9j0-k1l2-3456-ghij-k12345678901",
    "name": "DStv Confam",
    "code": "dstv-confam",
    "amount": 6200,
    "validity": "30 days",
    "description": "DStv Confam bouquet",
    "status": "active"
  },
  {
    "id": "h8i9j0k1-l2m3-4567-hijk-l12345678901",
    "name": "DStv Compact",
    "code": "dstv-compact",
    "amount": 10500,
    "validity": "30 days",
    "description": "DStv Compact bouquet",
    "status": "active"
  },
  {
    "id": "i9j0k1l2-m3n4-5678-ijkl-m12345678901",
    "name": "DStv Compact Plus",
    "code": "dstv-compact-plus",
    "amount": 17700,
    "validity": "30 days",
    "description": "DStv Compact Plus bouquet",
    "status": "active"
  },
  {
    "id": "j0k1l2m3-n4o5-6789-jklm-n12345678901",
    "name": "DStv Premium",
    "code": "dstv-premium",
    "amount": 24500,
    "validity": "30 days",
    "description": "DStv Premium bouquet",
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
                <h4 className="font-medium text-yellow-800 mb-1">Dynamic Plans</h4>
                <p className="text-yellow-700">
                  TV plans are fetched dynamically from VTPass. For the most up-to-date plans and pricing, always fetch the plans before making a purchase.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Verify Customer</h2>
          <p className="text-gray-700">
            Before purchasing a TV subscription, you should verify the customer's smartcard number to get their current subscription details and renewal amount.
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
  "serviceId": "dstv",
  "customerId": "1234567890"
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
  "serviceId": "dstv",
  "customerId": "1234567890"
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
                    <td className="px-4 py-2">Provider code: "dstv", "gotv", "startimes", or "showmax"</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">customerId</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Smartcard number or IUC number</td>
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
  "Status": "Active",
  "Due_Date": "2024-08-15",
  "Customer_Number": "1234567890",
  "Customer_Type": "DSTV",
  "Current_Bouquet": "DStv Compact",
  "Renewal_Amount": 10500,
  "Address": "123 Main Street, Lagos, Nigeria"
}`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              The <code>Renewal_Amount</code> field is what you'll use as the <code>amount</code> parameter in your purchase request when renewing a subscription.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Purchase TV Subscription</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Change Bouquet Request</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/purchase

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "tv",
  "amount": 10500,
  "recipient": "08012345678",
  "provider": "dstv",
  "variation_code": "dstv-compact",
  "biller_code": "1234567890",
  "subscription_type": "change"
}`, 'changeBouquetRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'changeBouquetRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/purchase</code> (Change Bouquet)
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
  "type": "tv",
  "amount": 10500,
  "recipient": "08012345678",
  "provider": "dstv",
  "variation_code": "dstv-compact",
  "biller_code": "1234567890",
  "subscription_type": "change"
}`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Renew Subscription Request</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/purchase

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "tv",
  "amount": 10500,
  "recipient": "08012345678",
  "provider": "dstv",
  "biller_code": "1234567890",
  "subscription_type": "renew"
}`, 'renewRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'renewRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/purchase</code> (Renew Subscription)
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
  "type": "tv",
  "amount": 10500,
  "recipient": "08012345678",
  "provider": "dstv",
  "biller_code": "1234567890",
  "subscription_type": "renew"
}`}
              </code>
            </pre>
            <p className="text-gray-600 mt-3">
              For renewal, the <code>variation_code</code> is optional as the system will use the customer's current bouquet.
            </p>
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
                  <td className="px-4 py-2">Must be "tv" for TV subscription purchases</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">amount</td>
                  <td className="px-4 py-2">number</td>
                  <td className="px-4 py-2">Yes</td>
                  <td className="px-4 py-2">Amount in NGN (should match the plan amount or renewal amount)</td>
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
                  <td className="px-4 py-2">Provider code: "dstv", "gotv", "startimes", or "showmax"</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">variation_code</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">Yes*</td>
                  <td className="px-4 py-2">Plan code from the plans endpoint. *Required for "change" subscription_type</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">biller_code</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">Yes</td>
                  <td className="px-4 py-2">Smartcard number or IUC number</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">subscription_type</td>
                  <td className="px-4 py-2">string</td>
                  <td className="px-4 py-2">Yes</td>
                  <td className="px-4 py-2">"change" for changing bouquet, "renew" for renewing current bouquet</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">quantity</td>
                  <td className="px-4 py-2">number</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Optional. Number of months to subscribe for (default: 1)</td>
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
  "message": "TV subscription purchase processed successfully",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "external_reference": "202407121234ABCDEF",
    "status": "pending", // Initially "pending", check status endpoint for updates
    "type": "tv",
    "amount": 10500,
    "user_discount": 157.5, // Discount applied (based on provider's commission_rate)
    "total_amount": 10342.5, // Actual amount deducted from wallet
    "recipient": "08012345678",
    "provider": "dstv",
    "variation_code": "dstv-compact",
    "biller_code": "1234567890",
    "description": "TV subscription purchase for 1234567890",
    "created_at": "2024-07-12T12:34:56.789Z",
    "updated_at": "2024-07-12T12:34:56.789Z"
  }
}`}
              </code>
            </pre>
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

async function verifyTvCustomer(serviceId, smartcardNumber) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/verify-customer\`,
      {
        serviceId,
        customerId: smartcardNumber
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Customer verification:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying customer:', error.response?.data || error.message);
    throw error;
  }
}

async function getTvPlans(providerId) {
  try {
    const response = await axios.get(
      \`\${BASE_URL}/services/\${providerId}/plans\`,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );
    
    console.log('Available TV plans:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching plans:', error.response?.data || error.message);
    throw error;
  }
}

async function renewTvSubscription(phoneNumber, provider, smartcardNumber, amount) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'tv',
        amount,
        recipient: phoneNumber,
        provider,
        biller_code: smartcardNumber,
        subscription_type: 'renew'
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
    console.error('Error renewing subscription:', error.response?.data || error.message);
    throw error;
  }
}

async function changeTvBouquet(phoneNumber, provider, smartcardNumber, variationCode, amount) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'tv',
        amount,
        recipient: phoneNumber,
        provider,
        variation_code: variationCode,
        biller_code: smartcardNumber,
        subscription_type: 'change'
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
    console.error('Error changing bouquet:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Verify DSTV customer
    const smartcardNumber = '1234567890';
    const customerInfo = await verifyTvCustomer('dstv', smartcardNumber);
    
    // Get DSTV provider ID
    const services = await axios.get(
      \`\${BASE_URL}/services\`,
      { headers: { 'x-api-key': API_KEY } }
    );
    
    const dstvProvider = services.data.find(p => p.code === 'dstv');
    
    if (!dstvProvider) {
      console.error('DSTV provider not found');
      return;
    }
    
    // Get DSTV plans
    const plans = await getTvPlans(dstvProvider.id);
    
    // Example 1: Renew current subscription
    if (customerInfo.Renewal_Amount) {
      const renewalTransaction = await renewTvSubscription(
        '08012345678',
        'dstv',
        smartcardNumber,
        customerInfo.Renewal_Amount
      );
      console.log('Renewal transaction:', renewalTransaction);
    }
    
    // Example 2: Change to a different bouquet
    const compactPlusPlan = plans.find(p => p.name.includes('Compact Plus'));
    
    if (compactPlusPlan) {
      const changeTransaction = await changeTvBouquet(
        '08012345678',
        'dstv',
        smartcardNumber,
        compactPlusPlan.code,
        compactPlusPlan.amount
      );
      console.log('Change bouquet transaction:', changeTransaction);
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
            <Link to="/api-docs/data" className="text-blue-600 hover:text-blue-700">
              ← Previous: Data API
            </Link>
            <Link to="/api-docs/electricity" className="text-blue-600 hover:text-blue-700">
              Next: Electricity API →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}