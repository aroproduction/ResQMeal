'use client'

import { Leaf, Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { Button } from './ui/button';
import Link from 'next/link';

const Navbar = () => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center py-3 backdrop-blur-sm bg-white/95 rounded-xl mt-3 px-2 sm:px-4 md:px-6 border border-gray-100 shadow-md">
                    <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto justify-between md:justify-start">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            <Link href="/">ResQMeal</Link>
                        </span>
                        {/* Mobile Menu Button */}
                        <div className="md:hidden ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
                        <Link href="/home" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-base lg:text-lg">Home</Link>
                        <Link href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-base lg:text-lg">Features</Link>
                        <Link href="#impact" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-base lg:text-lg">Impact</Link>
                        <Link href="#testimonials" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium text-base lg:text-lg">Reviews</Link>

                    </div>

                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 lg:px-8 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg text-base lg:text-lg cursor-pointer hidden md:flex">
                        <Link href="/login">Join Now</Link>
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-2 sm:mx-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4 space-y-2 sm:space-y-3 flex flex-col">
                        <a href="#home" className="block text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium py-2 text-base">Home</a>
                        <a href="#features" className="block text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium py-2 text-base">Features</a>
                        <a href="#impact" className="block text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium py-2 text-base">Impact</a>
                        <a href="#testimonials" className="block text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium py-2 text-base">Reviews</a>
                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 text-base">
                            Join Now
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar