import React from 'react';
import { Link } from 'react-router-dom';
import { businessInfo } from '../config/businessInfo';
import { 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Facebook, 
  Twitter, 
  Instagram,
  ChevronRight
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mr-3">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{businessInfo.name}</span>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              A comprehensive VTU platform providing seamless bill payments, airtime purchases, 
              data subscriptions, and more across Nigeria.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="ml-3 text-gray-300 text-sm">
                  {businessInfo.address.streetAddress}, {businessInfo.address.addressLocality}, 
                  {businessInfo.address.addressRegion}, {businessInfo.address.postalCode}
                </span>
              </div>
              
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a 
                  href={`tel:${businessInfo.telephone}`} 
                  className="ml-3 text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  {businessInfo.telephone}
                </a>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a 
                  href={`mailto:${businessInfo.email}`} 
                  className="ml-3 text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  {businessInfo.email}
                </a>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-2">
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard/make-transaction" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Airtime Top-up
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/make-transaction" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Data Bundles
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/make-transaction" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  TV Subscriptions
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/make-transaction" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Electricity Bills
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/make-transaction" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Education Payments
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-2">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-2">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/help" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/api-docs" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  API Documentation
                </Link>
              </li>
              <li>
                <Link 
                  to="/status" 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Status Page
                </Link>
              </li>
              <li>
                <a 
                  href={`mailto:${businessInfo.email}`} 
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center text-sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Social Media & Copyright */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a 
              href="https://facebook.com/vtuplatform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com/vtuplatform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://instagram.com/vtuplatform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} {businessInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Accent Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"></div>
    </footer>
  );
}