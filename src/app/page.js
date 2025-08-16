'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Globe,
  Star,
  Utensils,
  Recycle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: <Utensils className="h-8 w-8 text-emerald-600" />,
      title: "Smart Meal Planning",
      description: "AI-powered meal suggestions based on available ingredients and dietary preferences."
    },
    {
      icon: <Recycle className="h-8 w-8 text-blue-600" />,
      title: "Waste Reduction",
      description: "Track and minimize food waste with intelligent inventory management."
    },
    {
      icon: <MapPin className="h-8 w-8 text-purple-600" />,
      title: "Local Network",
      description: "Connect with local food banks and community kitchens for surplus sharing."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Community Impact",
      description: "Join a movement of conscious consumers making a difference."
    },
    {
      icon: <Shield className="h-8 w-8 text-teal-600" />,
      title: "Food Safety",
      description: "Ensure food quality with expiration tracking and safety guidelines."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
      title: "Impact Analytics",
      description: "Visualize your environmental impact and contribution to the community."
    }
  ];

  const stats = [
    { number: "50M+", label: "Meals Saved", icon: <Utensils className="h-6 w-6" /> },
    { number: "200K+", label: "Active Users", icon: <Users className="h-6 w-6" /> },
    { number: "85%", label: "Waste Reduced", icon: <Recycle className="h-6 w-6" /> },
    { number: "1000+", label: "Partner Organizations", icon: <Globe className="h-6 w-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Community Volunteer",
      content: "ResQMeal has transformed how our community handles food waste. We've connected with so many families in need.",
      rating: 5
    },
    {
      name: "Mark Chen",
      role: "Restaurant Owner",
      content: "Instead of throwing away surplus food, we now redirect it to those who need it most. It's incredibly fulfilling.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Food Bank Coordinator",
      content: "The platform makes it so easy to coordinate with local restaurants and manage our inventory efficiently.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation bar */}
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-16 sm:pt-24 pb-16 sm:pb-32 overflow-hidden">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30"></div>

        {/* Sophisticated background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-200/60 to-teal-200/60 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-gradient-to-br from-orange-200/60 to-pink-200/60 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* /* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
          <div className="text-center">
            <h1
              className={`font-heading text-3xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-6 sm:mb-8 transition-all duration-1000 tracking-tight leading-none ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            >
              <span className="text-balance">Rescue Food,</span>
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent text-shadow">
                Nourish Communities
              </span>
            </h1>

            <p
              className={`font-body text-base sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-200 text-pretty ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            >
              Transform surplus food into hope. Connect restaurants, grocers, and food banks to create a sustainable
              food ecosystem that feeds communities and protects our planet.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto transition-all duration-1000 delay-400 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            >
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-[220px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 sm:px-10 py-4 sm:py-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 font-body tracking-wide">
                  Start Rescuing Food
                  <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-[220px] border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 sm:px-10 py-4 sm:py-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 font-body tracking-wide"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Emerald gradient background */}
      <section id="impact" className="py-12 sm:py-20 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold mb-4 tracking-tight">Our Global Impact</h2>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto font-body leading-relaxed">
              Together, we&apos;re making a real difference in communities worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300">
                  <div className="flex justify-center mb-4 text-white">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-emerald-100 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Textured background */}
      <section id="features" className="py-12 sm:py-20 relative bg-gray-50">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #d1d5db 10px, #d1d5db 11px)',
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything You Need to Make an Impact
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto font-body leading-relaxed text-pretty">
              Our comprehensive platform connects all stakeholders in the food ecosystem to reduce waste and help communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-emerald-100">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Textured white background */}
      <section id="testimonials" className="py-12 sm:py-20 relative bg-white">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        {/* Wave pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #f3f4f6 40px, #f3f4f6 42px)',
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Voices from Our Community
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto font-body leading-relaxed text-pretty">
              Real stories from people who are making a difference with ResQMeal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced gradient with texture */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700"></div>
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 text-white">
          <h2 className="font-heading text-4xl font-bold mb-6 tracking-tight">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed font-body text-balance">
            Join thousands of community members, restaurants, and organizations working together to end food waste and hunger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-gray-100 px-6 sm:px-10 py-4 sm:py-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 px-6 sm:px-10 py-4 sm:py-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 backdrop-blur-sm bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
