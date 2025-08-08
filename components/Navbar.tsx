'use client'
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Menu, X, MapPin } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import Image from 'next/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/teachers", label: "Teachers" },
    { href: "/students", label: "Students" },
    { href: "/quiz/browse", label: "Quizzes" },
    { href: "/live-study", label: "Live Study" },
    { href: "/resume", label: "Resume" },
    { href: "/profile", label: "Profile" },
  ];

  const isActive = (href: string) => pathname === href;

  const openCampusMap = () => {
    window.open('https://www.google.com/maps/d/edit?mid=12mF2Yogrr8-amYjwTkdrk9z4pmjkGd0&usp=sharing', '_blank');
  };

  // Update CSS var --nav-h with current navbar height (handles mobile menu open/close and window resize)
  useEffect(() => {
    const updateNavHeight = () => {
      const h = navRef.current?.offsetHeight ?? 64; // fallback 64px
      document.documentElement.style.setProperty('--nav-h', `${h}px`);
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  useEffect(() => {
    // Recompute after mobile menu state changes
    const id = requestAnimationFrame(() => {
      const h = navRef.current?.offsetHeight ?? 64;
      document.documentElement.style.setProperty('--nav-h', `${h}px`);
    });
    return () => cancelAnimationFrame(id);
  }, [isMobileMenuOpen]);

  return (
    <nav ref={navRef} className="fixed w-full gradient-bg z-50 shadow-lg border-b border-white/10 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-sm p-1 rounded-lg shadow-md">
              <Image src="/logo.png" alt="COER Connect" width={28} height={28} className="rounded" />
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
              className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-blue-600 transition-all duration-200"
              onClick={openCampusMap}
            >
              <MapPin size={16} className="mr-2" />
              Campus Map
            </Button>

            <ThemeToggle />

            <SignedIn>
              <div className="bg-white/10 rounded-full p-1">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200">
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
          <div className="md:hidden py-4 border-t border-white/20 animate-fade-in">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-blue-600 transition-all duration-200"
                  onClick={() => {
                    openCampusMap();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <MapPin size={16} className="mr-2" />
                  Campus Map
                </Button>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-sm">Theme</span>
                  <ThemeToggle />
                </div>
                
                <SignedIn>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-white/90 text-sm">Account</span>
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton>
                    <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
