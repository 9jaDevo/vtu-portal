import React from 'react';
import { Link } from 'react-router-dom';
import { businessInfo } from '../config/businessInfo';
import { Footer } from '../components/Footer';
import { 
  CreditCard, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle, 
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {businessInfo.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500 text-sm">About Us</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About {businessInfo.name}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to simplify bill payments and digital services across Nigeria.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2023, {businessInfo.name} was created to address the challenges Nigerians face when trying to access digital services and make bill payments.
              </p>
              <p className="text-gray-600 mb-4">
                Our team of experienced developers and financial experts came together with a shared vision: to build a platform that makes digital transactions seamless, secure, and accessible to everyone.
              </p>
              <p className="text-gray-600">
                Today, we serve thousands of customers across Nigeria, providing instant access to airtime, data bundles, TV subscriptions, electricity payments, and more.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Our team at work" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600">
                We implement bank-level security measures to ensure your transactions and personal data are always protected.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reliability</h3>
              <p className="text-gray-600">
                Our platform is built for 99.9% uptime, ensuring you can access our services whenever you need them.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer-Centric</h3>
              <p className="text-gray-600">
                We put our customers first, constantly improving our platform based on your feedback and needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section - Important for Local SEO */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Location</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Serving customers across Nigeria from our headquarters in {businessInfo.address.addressLocality}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Address:</p>
                      <p className="text-gray-600">{businessInfo.address.streetAddress}</p>
                      <p className="text-gray-600">{businessInfo.address.addressLocality}, {businessInfo.address.addressRegion} {businessInfo.address.postalCode}</p>
                      <p className="text-gray-600">Nigeria</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Phone:</p>
                      <p className="text-gray-600">
                        <a href={`tel:${businessInfo.telephone}`} className="hover:text-blue-600">
                          {businessInfo.telephone}
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Email:</p>
                      <p className="text-gray-600">
                        <a href={`mailto:${businessInfo.email}`} className="hover:text-blue-600">
                          {businessInfo.email}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Service Areas:</h4>
                  <p className="text-gray-600">
                    We provide VTU services across all 36 states of Nigeria, including major cities like Lagos, Abuja, Port Harcourt, Kano, Ibadan, and Enugu.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-lg h-80 bg-gray-200">
              {/* Placeholder for a map - in a real implementation, you would embed Google Maps here */}
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-600">Interactive Map Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}