import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Wifi, 
  Tv, 
  Zap, 
  GraduationCap, 
  Shield,
  CreditCard,
  Users,
  Clock,
  BarChart,
  CheckCircle,
  ArrowRight,
  Star,
  Globe
} from 'lucide-react';

export function LandingPage() {
  const services = [
    { icon: Smartphone, name: 'Airtime Top-up', desc: 'All networks supported' },
    { icon: Wifi, name: 'Data Bundles', desc: 'Affordable data plans' },
    { icon: Tv, name: 'TV Subscriptions', desc: 'DSTV, GOtv, Startimes' },
    { icon: Zap, name: 'Electricity Bills', desc: 'All electricity providers' },
    { icon: GraduationCap, name: 'Education Payments', desc: 'WAEC, JAMB, NECO' },
    { icon: Shield, name: 'Insurance', desc: 'Quick insurance payments' }
  ];

  const features = [
    { icon: Clock, title: 'Instant Processing', desc: 'Transactions completed in seconds' },
    { icon: Shield, title: 'Secure Platform', desc: 'Bank-level security for all transactions' },
    { icon: BarChart, title: 'Real-time Analytics', desc: 'Track all your transactions in real-time' },
    { icon: Users, title: 'API Integration', desc: 'Integrate our services into your platform' }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '₦2B+', label: 'Total Transactions' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                VTU Pro
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The Future of 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                VTU Services
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience seamless bill payments, airtime purchases, and data subscriptions 
              with our cutting-edge platform. Fast, secure, and reliable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Free Today
                <ArrowRight className="inline w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/api-docs"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                View API Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              All Your Bills in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From airtime to electricity bills, we've got you covered with instant processing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose VTU Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for speed, security, and scalability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Business Owner",
                content: "VTU Pro has streamlined all our bill payments. The API integration is seamless and the support is excellent.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Developer",
                content: "The API documentation is clear and the response times are impressive. Perfect for our fintech application.",
                rating: 5
              },
              {
                name: "Aisha Okafor",
                role: "Small Business",
                content: "I've been using VTU Pro for 6 months. Never had a failed transaction. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users and start processing payments in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Create Free Account
            </Link>
            <Link
              to="/api-docs"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VTU Pro</span>
              </div>
              <p className="text-gray-400 mb-4">
                The most reliable VTU platform for all your payment needs.
              </p>
              <div className="flex items-center space-x-2 text-gray-400">
                <Globe className="w-4 h-4" />
                <span>Available 24/7</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Airtime Top-up</li>
                <li>Data Bundles</li>
                <li>TV Subscriptions</li>
                <li>Electricity Bills</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>API Documentation</li>
                <li>Status Page</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VTU Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}