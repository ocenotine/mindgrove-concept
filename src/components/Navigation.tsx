
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bookmark, Settings } from 'lucide-react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

const Navigation: React.FC = () => {
  return (
    <aside className="h-screen w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4">
        <Logo />
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`
              }
            >
              <Home size={18} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/search"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`
              }
            >
              <Search size={18} />
              <span>Research</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/saved"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`
              }
            >
              <Bookmark size={18} />
              <span>Saved</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) => 
            `flex items-center gap-2 p-2 rounded-md transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Navigation;
