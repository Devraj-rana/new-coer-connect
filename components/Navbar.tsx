'use client'
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Menu, X, MapPin } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/people", label: "People" },
    { href: "/teachers", label: "Teachers" },
    { href: "/students", label: "Students" },
    { href: "/live-study", label: "Live Study" },
    { href: "/resume", label: "Resume" },
    { href: "/profile", label: "Profile" },
  ];

  const isActive = (href: string) => pathname === href;

  const openCampusMap = () => {
    window.open('https://www.google.com/maps/d/edit?mid=12mF2Yogrr8-amYjwTkdrk9z4pmjkGd0&usp=sharing', '_blank');
  };

  return (
    <nav className="fixed w-full bg-gradient-to-r from-blue-600 to-indigo-800 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <span className="text-blue-600 font-bold text-xl">C</span>
            </div>
            <span className="text-white font-bold text-xl">COER Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-blue-600"
              onClick={openCampusMap}
            >
              <MapPin size={16} className="mr-2" />
              Campus Map
            </Button>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 rounded-md font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
              <Button
                variant="outline"
                className="w-full bg-white/10 text-white border-white/30 hover:bg-white hover:text-blue-600"
                onClick={() => {
                  openCampusMap();
                  setIsMobileMenuOpen(false);
                }}
              >
                <MapPin size={16} className="mr-2" />
                Campus Map
              </Button>

              <SignedOut>
                <SignInButton>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <div className="flex justify-center pt-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
