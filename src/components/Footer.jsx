import { Globe, Heart, Leaf, Users } from 'lucide-react'
import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">ResQMeal</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md">
                            Connecting communities to reduce food waste and create a more sustainable future for everyone.
                        </p>
                        <div className="flex space-x-4">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                                <Heart className="h-5 w-5" />
                            </div>
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} ResQMeal. All rights reserved. Building a sustainable future together.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer