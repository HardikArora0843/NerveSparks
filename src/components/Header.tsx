import React from 'react';
import { Zap, Cpu, Database, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 animate-fade-in-left">
            <div className="relative">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg animate-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse-slow"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span className="text-gradient">Neural</span>
                <span className="text-gray-300">RAG</span>
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse-slow" />
              </h1>
              <p className="text-sm text-gray-400">Advanced Document Intelligence Platform</p>
            </div>
          </div>

          {/* Features */}
          <div className="hidden md:flex items-center space-x-6 animate-fade-in-right">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <Cpu className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">AI Processing</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <Database className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">Vector Search</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <Sparkles className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">Smart Queries</span>
            </div>
          </div>

          {/* Theme Toggle and Version Badge */}
          <div className="flex items-center space-x-4 animate-fade-in-right">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <div className="relative w-5 h-5">
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-400 group-hover:-rotate-90 transition-transform duration-500" />
                )}
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>

            {/* Version Badge */}
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <span className="text-xs font-medium text-green-400">v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};