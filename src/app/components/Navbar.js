'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

function getPlatformIcon(platform) {
  const iconClass = 'w-5 h-5';
  switch (platform) {
    case 'YouTube':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      );
    case 'Facebook':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      );
    case 'Audio':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-6h4v-2h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      );
       case 'pexel':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-6h4v-2h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      );
    default:
      return null;
  }
}

 function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [istrue,settrue]=useState(true);
  const [activePage, setActivePage] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  const navItems = [
    { name: 'YouTube', path: '/',index:1 },
    { name: 'Facebook', path: '/facebookdownloader',index:2 },
    { name: 'Audio', path: '/audio',index:3 },
  ];

  // Sticky Navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`z-50 fixed top-0 w-full transition-all duration-300 ${isSticky ? 'shadow-md backdrop-blur bg-blue-600/80' : 'bg-gradient-to-r from-blue-600 to-blue-500'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-red-500">
                MultiDownloader
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) =>  (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${istrue && item.index==1 ? 'text-white border-b-2 border-yellow-400'
                      : 'text-gray-200 hover:text-white hover:bg-blue-700/30'} transition-all duration-300 ${
                    activePage === item.path
                      ? 'text-white border-b-2 border-yellow-400'
                      : 'text-gray-200 hover:text-white hover:bg-blue-700/30'
                  }`}
                  onClick={() => {
                    setActivePage(item.path); 
                    settrue(false)
                  
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(item.name)}
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-200 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } bg-blue-700/90 backdrop-blur-sm`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activePage === item.path
                  ? 'text-white bg-blue-800/50'
                  : 'text-gray-200 hover:text-white hover:bg-blue-700/30'
              }`}
              onClick={() => {
                setActivePage(item.path);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                {getPlatformIcon(item.name)}
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

const Navbar=React.memo(Nav);
export default Navbar;