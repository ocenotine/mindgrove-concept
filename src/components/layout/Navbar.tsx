
// This file contains the Navbar component used across the application
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  Home, BookOpen, LayoutDashboard, Settings, User2, LogOut, Plus, FileText, GraduationCap, Rocket, ListChecks,
  X, Menu, BarChart2 // Changed from ChartLine to BarChart2
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      showTo: ['student', 'admin', 'teacher', 'institution']
    },
    {
      title: 'Documents',
      href: '/documents',
      icon: <FileText className="h-5 w-5" />,
      showTo: ['student', 'admin', 'teacher']
    },
    {
      title: 'Flashcards',
      href: '/flashcards',
      icon: <BookOpen className="h-5 w-5" />,
      showTo: ['student', 'admin', 'teacher']
    },
    {
      title: 'Quizzes',
      href: '/quiz',
      icon: <ListChecks className="h-5 w-5" />,
      showTo: ['student', 'admin', 'teacher']
    },
    {
      title: 'Progress',
      href: '/progress',
      icon: <BarChart2 className="h-5 w-5" />, // Changed from ChartLine to BarChart2
      showTo: ['student', 'admin', 'teacher']
    },
    {
      title: 'AI Chat',
      href: '/ai-chat',
      icon: <Rocket className="h-5 w-5" />,
      showTo: ['student', 'admin', 'teacher']
    },
    {
      title: 'Institution Dashboard',
      href: '/institution/dashboard',
      icon: <GraduationCap className="h-5 w-5" />,
      showTo: ['institution']
    },
    {
      title: 'Institution AI Chat',
      href: '/institution/ai-chat',
      icon: <Rocket className="h-5 w-5" />,
      showTo: ['institution']
    },
    {
      title: 'Institution Settings',
      href: '/institution/settings',
      icon: <Settings className="h-5 w-5" />,
      showTo: ['institution']
    }
  ];

  const filteredNavLinks = navLinks.filter(link => {
    if (!isAuthenticated) return false;
    return link.showTo.includes('admin') || link.showTo.includes(user?.account_type || 'student');
  });

  return (
    <nav className="bg-background border-b sticky top-0 z-40">
      <div className="container max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center">
          <img src="/mindgrove.png" className="h-8 mr-3" alt="MindGrove Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-foreground">MindGrove</span>
        </Link>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-muted-foreground rounded-lg md:hidden hover:bg-muted focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="mobile-menu-3"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <Menu className="h-5 w-5" />
        </button>
        
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)} 
          />
        )}
        
        {/* Mobile menu dropdown */}
        <div
          className={`${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } fixed top-0 right-0 h-full w-64 bg-background border-l border-border shadow-xl transition-transform duration-300 ease-in-out z-50 overflow-auto`}
        >
          <div className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <img
                  src="/mindgrove.png"
                  alt="MindGrove"
                  className="h-8"
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {navLinks.map((link) => (
                <div key={link.title}>
                  <Link
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center p-2 rounded-md text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
                  >
                    {link.icon} <span className="ml-2">{link.title}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Add a spacer to push the bottom content down */}
            <div className="flex-grow" />

            {/* Bottom section of mobile menu */}
            <div className="mt-6 pt-6 border-t border-muted-foreground/20">
              <div className="space-y-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center p-2 rounded-md text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
                    >
                      <User2 className="h-5 w-5" /> <span className="ml-2">Profile</span>
                    </Link>
                    <Button 
                      onClick={handleLogout}
                      className="w-full justify-start text-left" 
                      variant="ghost"
                    >
                      <LogOut className="h-5 w-5 mr-2" /> Log out
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => { 
                        setIsMenuOpen(false);
                        navigate('/login');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => { 
                        setIsMenuOpen(false);
                        navigate('/signup');
                      }}
                      className="w-full"
                    >
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-900 dark:border-gray-700">
            {filteredNavLinks.map(link => (
              <li key={link.title}>
                <Link to={link.href} className="block py-2 pl-3 pr-4 text-foreground rounded md:bg-transparent md:text-primary md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">
                  <div className="flex items-center">
                    {link.icon}
                    <span className="ml-2">{link.title}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User2 className="h-4 w-4 mr-2" /> Profile
                </Button>
              </Link>
              <Button onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
