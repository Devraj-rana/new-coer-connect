'use client'
import React from "react";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <div className="fixed w-full bg-gradient-to-r from-blue-600 to-indigo-800 z-50 shadow-lg">
      <div className="flex items-center max-w-6xl justify-between h-16 mx-auto px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="bg-white p-1 rounded-md shadow-md">
              <div className="text-blue-600 font-bold text-xl">C</div>
            </div>
            <span className="ml-2 text-white font-bold text-xl">
              COER Connect
            </span>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="http://localhost:3000"
            className="text-white hover:text-blue-200 transition-colors duration-200 font-medium"
          >
            Home
          </a>
          <a
            href="/live-study"
            className="text-white hover:text-blue-200 transition-colors duration-200 font-medium"
          >
            Live 
          </a>
          <a
            href="http://localhost:8501/"
            className="text-white hover:text-blue-200 transition-colors duration-200 font-medium"
          >
            Resume
          </a>
          <a
            href="/profile"
            className="text-white hover:text-blue-200 transition-colors duration-200 font-medium"
          >
            Profile
          </a>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <Button
              variant="outline"
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-md border-none mr-2"
              onClick={() => window.open('https://www.google.com/maps/d/edit?mid=12mF2Yogrr8-amYjwTkdrk9z4pmjkGd0&usp=sharing', '_blank')}
            >
              Campus Map
            </Button>
            <div className="bg-white rounded-full p-0.5">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-md font-medium shadow-md transition-all duration-200">
              <SignInButton />
            </Button>
          </SignedOut>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-white hover:bg-blue-700 p-2"
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
