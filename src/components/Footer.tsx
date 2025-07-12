import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Globe } from 'lucide-react';
import { businessInfo } from '../config/businessInfo';

// CSS class to ensure links are clickable
const clickableLink = "hover:text-blue-300 pointer-events-auto";

export function Footer() {
  return (
    <footer className="bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{businessInfo.name}</span>
            </div>
            <p className="text-gray-400 mb-4">
              The most reliable VTU platform for all your payment needs.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <Globe className="w-4 h-4" />
              <span>Available 24/7</span>
            </div>
            {/* NAP details */}
            <div className="mt-4 text-gray-400 text-sm">
              <p><strong>Address:</strong> {businessInfo.address.streetAddress}, {businessInfo.address.addressLocality}, {businessInfo.address.addressRegion}, {businessInfo.address.postalCode}</p>
              <p><strong>Phone:</strong> <a href={`tel:${businessInfo.telephone}`} className={`${clickableLink}`}>{businessInfo.telephone}</a></p>
              <p><strong>Email:</strong> <a href={`mailto:${businessInfo.email}`} className={`${clickableLink}`}>{businessInfo.email}</a></p>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400 pointer-events-auto">
              <li className="pointer-events-auto"><Link to="/dashboard/make-transaction" className={`${clickableLink}`}>Airtime Top-up</Link></li>
              <li className="pointer-events-auto"><Link to="/dashboard/make-transaction" className={`${clickableLink}`}>Data Bundles</Link></li>
              <li className="pointer-events-auto"><Link to="/dashboard/make-transaction" className={`${clickableLink}`}>TV Subscriptions</Link></li>
              <li className="pointer-events-auto"><Link to="/dashboard/make-transaction" className={`${clickableLink}`}>Electricity Bills</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400 pointer-events-auto">
              <li className="pointer-events-auto"><Link to="/about" className={`${clickableLink}`}>About Us</Link></li>
              <li className="pointer-events-auto"><Link to="/contact" className={`${clickableLink}`}>Contact</Link></li>
              <li className="pointer-events-auto"><Link to="/privacy" className={`${clickableLink}`}>Privacy Policy</Link></li>
              <li className="pointer-events-auto"><Link to="/terms" className={`${clickableLink}`}>Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 pointer-events-auto">
              <li className="pointer-events-auto"><Link to="/help" className={`${clickableLink}`}>Help Center</Link></li>
              <li className="pointer-events-auto"><Link to="/api-docs" className={`${clickableLink}`}>API Documentation</Link></li>
              <li className="pointer-events-auto"><Link to="/status" className={`${clickableLink}`}>Status Page</Link></li>
              <li className="pointer-events-auto"><a href={`mailto:${businessInfo.email}`} className={`${clickableLink}`}>Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {businessInfo.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}