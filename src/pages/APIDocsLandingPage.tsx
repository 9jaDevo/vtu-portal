import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  ArrowLeft, 
  Download, 
  Copy, 
  CheckCircle, 
  Key, 
  CreditCard, 
  ShoppingCart, 
  ArrowRight,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  GraduationCap,
  Shield,
  FileText, 
  CheckSquare
} from 'lucide-react';

export function APIDocsLandingPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadPostmanCollection = () => {
    const postmanCollection = {
      "info": {
        "_postman_id": "e5f8c5b0-1234-5678-9abc-def012345678",
        "name": "VTU Pro API",
        "description": "API collection for VTU Pro platform",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      "item": [
        {
          "name": "Authentication & API Keys",
          "item": [
            {
              "name": "Generate API Key",
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "Authorization",
                    "value": "Bearer {{jwt_token}}",
                    "type": "text"
                  },
                  {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"name\": \"My API Key\",\n    \"usage_limit\": 10000\n}"
                },
                "url": {
                  "raw": "{{base_url}}/api/keys",
                  "host": ["{{base_url}}"],
                  "path": ["api", "keys"]
                },
                "description": "Generate a new API key for your account"
              }
            },
            {
              "name": "Get All API Keys",
              "request": {
                "method": "GET",
                "header": [
                  {
                    "key": "Authorization",
                    "value": "Bearer {{jwt_token}}",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/api/keys",
                  "host": ["{{base_url}}"],
                  "path": ["api", "keys"]
                },
                "description": "Get all API keys for your account"
              }
            },
            {
              "name": "Revoke API Key",
              "request": {
                "method": "DELETE",
                "header": [
                  {
                    "key": "Authorization",
                    "value": "Bearer {{jwt_token}}",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/api/keys/{{api_key_id}}",
                  "host": ["{{base_url}}"],
                  "path": ["api", "keys", "{{api_key_id}}"]
                },
                "description": "Revoke an API key"
              }
            }
          ]
        },
        {
          "name": "Public API Endpoints",
          "item": [
            {
              "name": "Get Account Balance",
              "request": {
                "method": "GET",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/api/balance",
                  "host": ["{{base_url}}"],
                  "path": ["api", "balance"]
                },
                "description": "Get your account balance"
              }
            },
            {
              "name": "Purchase Airtime",
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  },
                  {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"type\": \"airtime\",\n    \"amount\": 100,\n    \"recipient\": \"08012345678\",\n    \"provider\": \"mtn\"\n}"
                },
                "url": {
                  "raw": "{{base_url}}/api/purchase",
                  "host": ["{{base_url}}"],
                  "path": ["api", "purchase"]
                },
                "description": "Purchase airtime"
              }
            },
            {
              "name": "Purchase Data",
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  },
                  {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"type\": \"data\",\n    \"amount\": 1000,\n    \"recipient\": \"08012345678\",\n    \"provider\": \"mtn-data\",\n    \"variation_code\": \"mtn-100mb-1000\"\n}"
                },
                "url": {
                  "raw": "{{base_url}}/api/purchase",
                  "host": ["{{base_url}}"],
                  "path": ["api", "purchase"]
                },
                "description": "Purchase data bundle"
              }
            },
            {
              "name": "Get Transaction Status",
              "request": {
                "method": "GET",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/api/transaction/{{transaction_reference}}",
                  "host": ["{{base_url}}"],
                  "path": ["api", "transaction", "{{transaction_reference}}"]
                },
                "description": "Get status of a transaction"
              }
            },
            {
              "name": "Get Transaction History",
              "request": {
                "method": "GET",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/api/transactions?page=1&limit=20",
                  "host": ["{{base_url}}"],
                  "path": ["api", "transactions"],
                  "query": [
                    {
                      "key": "page",
                      "value": "1"
                    },
                    {
                      "key": "limit",
                      "value": "20"
                    }
                  ]
                },
                "description": "Get transaction history"
              }
            },
            {
              "name": "Get Available Services",
              "request": {
                "method": "GET",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/api/services",
                  "host": ["{{base_url}}"],
                  "path": ["api", "services"]
                },
                "description": "Get all available services"
              }
            },
            {
              "name": "Get Service Plans",
              "request": {
                "method": "GET",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/api/services/{{provider_id}}/plans",
                  "host": ["{{base_url}}"],
                  "path": ["api", "services", "{{provider_id}}", "plans"]
                },
                "description": "Get plans for a specific service provider"
              }
            },
            {
              "name": "Verify Customer",
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "x-api-key",
                    "value": "{{api_key}}",
                    "type": "text"
                  },
                  {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"serviceId\": \"ikeja-electric\",\n    \"customerId\": \"1234567890\",\n    \"type\": \"prepaid\"\n}"
                },
                "url": {
                  "raw": "{{base_url}}/api/verify-customer",
                  "host": ["{{base_url}}"],
                  "path": ["api", "verify-customer"]
                },
                "description": "Verify customer details"
              }
            }
          ]
        }
      ],
      "variable": [
        {
          "key": "base_url",
          "value": "http://localhost:3001"
        },
        {
          "key": "jwt_token",
          "value": "your_jwt_token_here"
        },
        {
          "key": "api_key",
          "value": "your_api_key_here"
        },
        {
          "key": "api_key_id",
          "value": "your_api_key_id_here"
        },
        {
          "key": "transaction_reference",
          "value": "your_transaction_reference_here"
        },
        {
          "key": "provider_id",
          "value": "your_provider_id_here"
        }
      ]
    };

    // Create a blob from the JSON
    const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VTU_Pro_API_Collection.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to the VTU Pro API documentation. This API allows you to integrate our Virtual Top-Up services directly into your applications.
          </p>
          <button 
            onClick={downloadPostmanCollection}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Postman Collection
          </button>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Getting Started</h3>
          <ol className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
              <span>Create an account on VTU Pro and log in</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
              <span>Navigate to the API Keys section in your dashboard</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
              <span>Generate a new API key and store it securely</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</span>
              <span>Use the API key in the <code>x-api-key</code> header for all API requests</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">5</span>
              <span>Fund your wallet to ensure you have sufficient balance for transactions</span>
            </li>
          </ol>
        </div>

        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Authentication & API Keys</h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Generate API Key</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/keys

Headers:
  Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json

Body:
{
  "name": "My New App Key",
  "usage_limit": 10000 // Optional: set a usage limit
}`, 'generate')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'generate' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-gray-700 mb-2">
              <code>POST /api/keys</code>
            </p>
            <p className="text-gray-600">
              Generate a new API key for your account. Requires user authentication (JWT).
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json

Body:
{
  "name": "My New App Key",
  "usage_limit": 10000 // Optional: set a usage limit
}`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Get All API Keys</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/keys

Headers:
  Authorization: Bearer <YOUR_JWT_TOKEN>`, 'getKeys')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'getKeys' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-gray-700 mb-2">
              <code>GET /api/keys</code>
            </p>
            <p className="text-gray-600">
              Retrieve all API keys associated with your account. Requires user authentication (JWT).
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  Authorization: Bearer <YOUR_JWT_TOKEN>`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Revoke API Key</h3>
              <button 
                onClick={() => copyToClipboard(`DELETE /api/keys/:id

Headers:
  Authorization: Bearer <YOUR_JWT_TOKEN>`, 'revokeKey')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'revokeKey' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-gray-700 mb-2">
              <code>DELETE /api/keys/:id</code>
            </p>
            <p className="text-gray-600">
              Revoke an existing API key by its ID. Requires user authentication (JWT).
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  Authorization: Bearer <YOUR_JWT_TOKEN>`}
              </code>
            </pre>
          </div>
        </section>

        {/* Service-specific Documentation Links */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Service-Specific Documentation</h2>
          </div>
          
          <p className="text-gray-700">
            Each service has its own dedicated documentation page with detailed information about available providers, plans, verification requirements, and sample requests/responses.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {[
              { 
                name: 'Airtime API', 
                icon: Smartphone, 
                color: 'bg-blue-100', 
                textColor: 'text-blue-600',
                borderColor: 'border-blue-200',
                hoverColor: 'hover:border-blue-400',
                description: 'Purchase airtime for all networks',
                path: '/api-docs/airtime'
              },
              { 
                name: 'Data API', 
                icon: Wifi, 
                color: 'bg-green-100', 
                textColor: 'text-green-600',
                borderColor: 'border-green-200',
                hoverColor: 'hover:border-green-400',
                description: 'Purchase data bundles for all networks',
                path: '/api-docs/data'
              },
              { 
                name: 'TV API', 
                icon: Tv, 
                color: 'bg-purple-100', 
                textColor: 'text-purple-600',
                borderColor: 'border-purple-200',
                hoverColor: 'hover:border-purple-400',
                description: 'Pay for TV subscriptions (DSTV, GOtv, etc.)',
                path: '/api-docs/tv'
              },
              { 
                name: 'Electricity API', 
                icon: Zap, 
                color: 'bg-yellow-100', 
                textColor: 'text-yellow-600',
                borderColor: 'border-yellow-200',
                hoverColor: 'hover:border-yellow-400',
                description: 'Pay electricity bills for all providers',
                path: '/api-docs/electricity'
              },
              { 
                name: 'Education API', 
                icon: GraduationCap, 
                color: 'bg-indigo-100', 
                textColor: 'text-indigo-600',
                borderColor: 'border-indigo-200',
                hoverColor: 'hover:border-indigo-400',
                description: 'Pay for WAEC, JAMB, NECO services',
                path: '/api-docs/education'
              },
              { 
                name: 'Insurance API', 
                icon: Shield, 
                color: 'bg-red-100', 
                textColor: 'text-red-600',
                borderColor: 'border-red-200',
                hoverColor: 'hover:border-red-400',
                description: 'Purchase vehicle insurance',
                path: '/api-docs/insurance'
              }
            ].map((service, index) => (
              <Link 
                key={index} 
                to={service.path}
                className={`p-6 border ${service.borderColor} rounded-xl ${service.hoverColor} hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center`}>
                    <service.icon className={`w-5 h-5 ${service.textColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className={`flex items-center ${service.textColor} font-medium`}>
                  View Documentation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Public API Endpoints (Requires API Key)</h2>
          </div>
          <p className="text-gray-700">
            These endpoints require an <code>x-api-key</code> header with a valid API key.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Get Account Balance</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/balance

Headers:
  x-api-key: <YOUR_API_KEY>`, 'balance')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'balance' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>GET /api/balance</code>
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GET</span>
            </div>
            <p className="text-gray-600">
              Retrieve the wallet balance for the user associated with the API key.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Purchase Service</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/purchase

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "airtime", // e.g., "airtime", "data", "tv", "electricity", "education", "insurance"
  "amount": 100,
  "recipient": "08012345678",
  "provider": "mtn", // Service provider code (e.g., "mtn", "airtel-data", "dstv")
  "variation_code": "mtn-100mb-1000", // Required for data, TV, electricity, education, insurance
  "biller_code": "1234567890", // Required for TV (smartcard), electricity (meter number), JAMB (profile ID), insurance (plate number)
  "callback_url": "https://your-app.com/webhook" // Optional: for transaction status updates
}`, 'purchase')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'purchase' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/purchase</code>
              </p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">POST</span>
            </div>
            <p className="text-gray-600">
              Initiate a purchase for various VTU services.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "type": "airtime", // e.g., "airtime", "data", "tv", "electricity", "education", "insurance"
  "amount": 100,
  "recipient": "08012345678",
  "provider": "mtn", // Service provider code (e.g., "mtn", "airtel-data", "dstv")
  "variation_code": "mtn-100mb-1000", // Required for data, TV, electricity, education, insurance
  "biller_code": "1234567890", // Required for TV (smartcard), electricity (meter number), JAMB (profile ID), insurance (plate number)
  "callback_url": "https://your-app.com/webhook" // Optional: for transaction status updates
}`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Get Transaction Status</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/transaction/:reference

Headers:
  x-api-key: <YOUR_API_KEY>`, 'status')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'status' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>GET /api/transaction/:reference</code>
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GET</span>
            </div>
            <p className="text-gray-600">
              Check the status of a specific transaction using its external reference.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Get Transaction History</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/transactions?page=1&limit=20

Headers:
  x-api-key: <YOUR_API_KEY>`, 'history')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'history' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>GET /api/transactions</code>
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GET</span>
            </div>
            <p className="text-gray-600">
              Retrieve a paginated list of all transactions made with the API key.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>

Query Parameters:
  page: (optional) Page number (default: 1)
  limit: (optional) Number of items per page (default: 20, max: 100)`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Get Available Services</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/services

Headers:
  x-api-key: <YOUR_API_KEY>`, 'services')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'services' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>GET /api/services</code>
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GET</span>
            </div>
            <p className="text-gray-600">
              Retrieve a list of all available service providers.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Get Service Plans</h3>
              <button 
                onClick={() => copyToClipboard(`GET /api/services/:provider_id/plans

Headers:
  x-api-key: <YOUR_API_KEY>`, 'plans')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'plans' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>GET /api/services/:provider_id/plans</code>
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GET</span>
            </div>
            <p className="text-gray-600">
              Retrieve plans for a specific service provider.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-800 mb-3">Verify Customer</h3>
              <button 
                onClick={() => copyToClipboard(`POST /api/verify-customer

Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "serviceId": "ikeja-electric", // e.g., "dstv", "gotv", "ikeja-electric"
  "customerId": "1234567890", // e.g., smartcard number, meter number
  "type": "prepaid" // Optional: for electricity, specify "prepaid" or "postpaid"
}`, 'verify')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedSection === 'verify' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-gray-700">
                <code>POST /api/verify-customer</code>
              </p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">POST</span>
            </div>
            <p className="text-gray-600">
              Verify customer details for services like electricity or TV.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`Headers:
  x-api-key: <YOUR_API_KEY>
  Content-Type: application/json

Body:
{
  "serviceId": "ikeja-electric", // e.g., "dstv", "gotv", "ikeja-electric"
  "customerId": "1234567890", // e.g., smartcard number, meter number
  "type": "prepaid" // Optional: for electricity, specify "prepaid" or "postpaid"
}`}
              </code>
            </pre>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Response Formats</h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Success Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// Example success response for a purchase
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "reference": "202407121234ABCDEF",
  "status": "pending",
  "amount": 100,
  "total_amount": 97,
  "message": "Transaction initiated successfully"
}`}
              </code>
            </pre>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800 mb-3">Error Response</h3>
            <pre className="bg-gray-800 text-white p-3 rounded-md text-sm mt-3 overflow-x-auto">
              <code>
{`// Example error response
{
  "error": "Insufficient balance",
  "required": 100,
  "available": 50
}`}
              </code>
            </pre>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Best Practices</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Error Handling</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Always check for error responses and handle them gracefully</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Implement exponential backoff for retries on server errors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Log detailed error information for troubleshooting</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Security</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Never expose your API key in client-side code</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Use HTTPS for all API requests</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Rotate API keys periodically for enhanced security</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Rate Limiting</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Implement client-side rate limiting to avoid hitting server limits</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Handle 429 Too Many Requests responses appropriately</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Consider setting appropriate usage limits when creating API keys</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Transaction Management</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Always store transaction references for future reference</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Implement webhook handlers for asynchronous transaction updates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1" />
                  <span>Periodically check the status of pending transactions</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-gray-600 text-center">
            Need more help? Contact our support team at <a href="mailto:support@vtuplatform.com" className="text-blue-600 hover:text-blue-700">support@vtuplatform.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}