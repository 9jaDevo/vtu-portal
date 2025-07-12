import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Smartphone,
  AlertCircle
} from 'lucide-react';

export function AirtimeDocsPage() {
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
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Airtime API</h1>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Airtime Service Overview</h3>
          <p className="text-blue-700 mb-4">
            The Airtime API allows you to programmatically purchase airtime for all major Nigerian mobile networks including MTN, Airtel, Glo, and 9mobile.
          </p>
          <div className="flex items-start space-x-2 text-blue-700">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <p>
              Airtime transactions are the simplest to implement as they require minimal parameters compared to other services.
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Providers</h2>
          <p className="text-gray-700">
            You can retrieve the list of available airtime providers using the <code>GET /api/services</code> endpoint with the <code>x-api-key</code> header. Filter the response for providers with <code>type: "airtime"</code>.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Sample Provider Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// GET /api/services response (filtered for airtime providers)
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "MTN Nigeria",
    "type": "airtime",
    "code": "mtn",
    "logo_url": "https://example.com/logos/mtn.png",
    "status": "active",
    "commission_rate": 3.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "name": "Airtel Nigeria",
    "type": "airtime",
    "code": "airtel",
    "logo_url": "https://example.com/logos/airtel.png",
    "status": "active",
    "commission_rate": 3.4,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "c3d4e5f6-g7h8-9012-cdef-g12345678901",
    "name": "Glo Nigeria",
    "type": "airtime",
    "code": "glo",
    "logo_url": "https://example.com/logos/glo.png",
    "status": "active",
    "commission_rate": 4.0,
    "commission_type": "percentage",
    "flat_fee_amount": 0.00,
    "is_enabled": true
  },
  {
    "id": "d4e5f6g7-h8i9-0123-defg-h12345678901",
    "name": "9mobile Nigeria",
    "type": "airtime",
    "code": "etisalat",
    "logo_url": "https://example.com/logos/9mobile.png",
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
          <h2 className="text-2xl font-semibold text-gray-900">Purchase Airtime</h2>
          
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
  "type": "airtime",
  "amount": 100,
  "recipient": "08012345678",
  "provider": "mtn"
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
  "type": "airtime",
  "amount": 100,
  "recipient": "08012345678",
  "provider": "mtn"
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
                    <td className="px-4 py-2">Must be "airtime" for airtime purchases</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">amount</td>
                    <td className="px-4 py-2">number</td>
                    <td className="px-4 py-2">Yes</td>
                    <td className="px-4 py-2">Amount in NGN (min: 50, max: 100,000)</td>
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
                    <td className="px-4 py-2">Provider code: "mtn", "airtel", "glo", or "etisalat" (9mobile)</td>
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
  "message": "Transaction initiated successfully",
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "external_reference": "202407121234ABCDEF",
    "status": "pending", // Initially "pending", check status endpoint for updates
    "type": "airtime",
    "amount": 100,
    "user_discount": 3, // Discount applied (based on provider's commission_rate)
    "total_amount": 97, // Actual amount deducted from wallet
    "recipient": "08012345678",
    "provider": "mtn",
    "description": "Airtime purchase for 08012345678",
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
                <h4 className="font-medium text-gray-800 mb-2">Invalid API Key</h4>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
                  <code>
{`// HTTP Status: 401 Unauthorized
{
  "error": "Invalid API key"
}`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Insufficient Balance</h4>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
                  <code>
{`// HTTP Status: 400 Bad Request
{
  "error": "Insufficient balance",
  "required": 100,
  "available": 50
}`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Validation Error</h4>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
                  <code>
{`// HTTP Status: 400 Bad Request
{
  "error": "\"recipient\" is required"
}`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Provider Error</h4>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
                  <code>
{`// HTTP Status: 500 Internal Server Error
{
  "error": "Failed to process airtime purchase",
  "message": "Network error occurred"
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Check Transaction Status</h2>
          <p className="text-gray-700">
            After initiating a transaction, you can check its status using the <code>external_reference</code> returned in the purchase response.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Request</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/transaction/202407121234ABCDEF

Headers:
  x-api-key: <YOUR_API_KEY>`, 'statusRequest')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'statusRequest' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>GET /api/transaction/:reference</code>
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
            <h3 className="text-xl font-medium text-gray-800 mb-3">Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// HTTP Status: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "external_reference": "202407121234ABCDEF",
  "type": "airtime",
  "amount": 100,
  "user_discount": 3,
  "total_amount": 97,
  "recipient": "08012345678",
  "provider": "mtn",
  "status": "success", // Possible values: "pending", "success", "failed", "reversed"
  "created_at": "2024-07-12T12:34:56.789Z",
  "updated_at": "2024-07-12T12:35:01.234Z"
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

async function purchaseAirtime(phoneNumber, amount, provider) {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/purchase\`,
      {
        type: 'airtime',
        amount,
        recipient: phoneNumber,
        provider
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
    console.error('Error purchasing airtime:', error.response?.data || error.message);
    throw error;
  }
}

async function checkTransactionStatus(reference) {
  try {
    const response = await axios.get(
      \`\${BASE_URL}/transaction/\${reference}\`,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );
    
    console.log('Transaction status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking status:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Purchase airtime
    const transaction = await purchaseAirtime('08012345678', 100, 'mtn');
    
    // Wait a few seconds for processing
    console.log('Waiting for transaction to process...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check transaction status
    const status = await checkTransactionStatus(transaction.transaction.external_reference);
    console.log('Final status:', status.status);
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

main();`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Python Example</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`import requests
import time

API_KEY = 'your_api_key_here'
BASE_URL = 'http://localhost:3001/api'  # Change to your production URL

def purchase_airtime(phone_number, amount, provider):
    try:
        response = requests.post(
            f"{BASE_URL}/purchase",
            json={
                "type": "airtime",
                "amount": amount,
                "recipient": phone_number,
                "provider": provider
            },
            headers={
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            }
        )
        response.raise_for_status()
        print("Transaction initiated:", response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print("Error purchasing airtime:", e)
        if hasattr(e, 'response') and e.response:
            print("Error details:", e.response.json())
        raise

def check_transaction_status(reference):
    try:
        response = requests.get(
            f"{BASE_URL}/transaction/{reference}",
            headers={
                "x-api-key": API_KEY
            }
        )
        response.raise_for_status()
        print("Transaction status:", response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print("Error checking status:", e)
        if hasattr(e, 'response') and e.response:
            print("Error details:", e.response.json())
        raise

# Example usage
def main():
    try:
        # Purchase airtime
        transaction = purchase_airtime("08012345678", 100, "mtn")
        
        # Wait a few seconds for processing
        print("Waiting for transaction to process...")
        time.sleep(5)
        
        # Check transaction status
        status = check_transaction_status(transaction["transaction"]["external_reference"])
        print("Final status:", status["status"])
    except Exception as e:
        print("Operation failed:", e)

if __name__ == "__main__":
    main()`}
              </code>
            </pre>
          </div>
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex justify-between">
            <Link to="/api-docs" className="text-blue-600 hover:text-blue-700">
              Back to API Documentation
            </Link>
            <Link to="/api-docs/data" className="text-blue-600 hover:text-blue-700">
              Next: Data API →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}