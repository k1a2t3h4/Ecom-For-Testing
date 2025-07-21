'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu } from "lucide-react";
import { collections } from './ProductWrapper';
import settings from './settings';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  return (
    <header
      style={{
        background: settings.colors.background,
        boxShadow: settings.border.shadow,
        borderBottom: `${settings.border.thickness} solid ${settings.colors.border}`,
        fontFamily: settings.font.family,
      }}
      className="w-full"
    >
      {/* Top Announcement Bar */}
      <div
        style={{
          background: `linear-gradient(90deg, ${settings.colors.primary}, ${settings.colors.secondary})`,
          color: settings.colors.background,
          fontSize: settings.font.smallSize,
          padding: settings.spacing.paddingSm,
        }}
        className="text-center font-medium"
      >
        🌸 Spring Collection Now Live - Up to 50% Off | Free Shipping Worldwide 🌸
      </div>

      {/* Main Header */}
      <div
        style={{
          padding: settings.spacing.padding,
          maxWidth: settings.breakpoints.xl,
          margin: '0 auto',
        }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3" style={{ textDecoration: 'none' }}>
          <div className="relative">
            <div
              style={{
                width: '3rem', height: '3rem',
                background: `linear-gradient(135deg, ${settings.colors.secondary}, ${settings.colors.primary})`,
                borderRadius: '50%',
                boxShadow: settings.border.shadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ color: settings.colors.background, fontWeight: settings.font.weightBold, fontSize: '1.5rem' }}>👗</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4" style={{ background: settings.colors.alternative, borderRadius: '50%' }}></div>
          </div>
          <div>
            <span
              style={{
                fontSize: settings.font.topicSize,
                fontWeight: settings.font.weightBold,
                background: `linear-gradient(90deg, ${settings.colors.primary}, ${settings.colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
              }}
            >
              Elegante
            </span>
            <div style={{ fontSize: settings.font.smallSize, color: settings.colors.textSecondary, fontStyle: 'italic' }}>
              Fashion & Style
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {collections.map((collection) => (
            <div
              key={collection.name}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(collection.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                style={{
                  color: settings.colors.text,
                  fontWeight: settings.font.weightBold,
                  fontSize: settings.font.contentSize,
                  padding: settings.spacing.paddingSm,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="flex items-center space-x-1 hover:text-pink-600 transition-colors duration-300 py-2 relative"
              >
                <span>{collection.name}</span>
                <ChevronDown className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-500 group-hover:w-full transition-all duration-300"></div>
              </button>
              {activeDropdown === collection.name && (
                <div
                  className="absolute top-full left-0 pt-1 w-56 z-50 overflow-hidden"
                  style={{
                    background: settings.colors.background,
                    borderRadius: settings.border.radius,
                    boxShadow: settings.border.shadow,
                    border: `${settings.border.thickness} solid ${settings.colors.border}`,
                  }}
                >
                  <div className="py-2">
                    {collection.items.map((item) => (
                      <Link
                        key={item}
                        href={`/collection/${encodeURIComponent(item)}`}
                        className="block px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 hover:pl-6"
                        style={{ fontSize: settings.font.contentSize }}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <a
            href="#"
            style={{ color: settings.colors.primary, fontWeight: settings.font.weightBold, fontSize: settings.font.contentSize }}
            className="hover:text-pink-700 transition-colors duration-200"
          >
            Sale
          </a>
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
          <div
            className="hidden md:flex items-center border transition-colors duration-200"
            style={{
              background: settings.colors.surface,
              borderRadius: settings.border.radius,
              border: `${settings.border.thickness} solid ${settings.colors.border}`,
              padding: settings.spacing.paddingSm,
            }}
          >
            <input
              type="text"
              placeholder="Search fashion..."
              className="bg-transparent text-gray-800 placeholder-gray-500 outline-none"
              style={{ fontSize: settings.font.contentSize, width: '12rem' }}
            />
            <button style={{ color: settings.colors.primary, marginLeft: '0.5rem' }}>
              🔍
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative" style={{ color: settings.colors.text, padding: settings.spacing.paddingSm }}>
              <span style={{ fontSize: settings.font.topicSize }}>💝</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">5</span>
            </button>
            <button className="relative" style={{ color: settings.colors.text, padding: settings.spacing.paddingSm }}>
              <span style={{ fontSize: settings.font.topicSize }}>🛍️</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
            </button>
            <Link href="/profile" className="text-gray-700 hover:text-pink-600 transition-colors duration-200 p-2 font-medium">
              <button style={{ color: settings.colors.text, padding: settings.spacing.paddingSm }}>
                <span style={{ fontSize: settings.font.topicSize }}>👤</span>
              </button>
            </Link>
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              style={{ color: settings.colors.text, padding: settings.spacing.paddingSm }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden mt-6"
          style={{
            background: settings.colors.surface,
            borderRadius: settings.border.radius,
            border: `${settings.border.thickness} solid ${settings.colors.border}`,
            padding: settings.spacing.padding,
          }}
        >
          <div className="py-4 px-4 space-y-4">
            {collections.map((collection) => (
              <div key={collection.name}>
                <button
                  className="w-full text-left font-semibold border-b"
                  style={{
                    color: settings.colors.text,
                    borderBottom: `${settings.border.thickness} solid ${settings.colors.border}`,
                    fontSize: settings.font.contentSize,
                    padding: settings.spacing.paddingSm,
                  }}
                >
                  {collection.name}
                </button>
                <div className="pl-4 pt-2 space-y-2">
                  {collection.items.map((item) => (
                    <Link
                      key={item}
                      href={`/collection/${encodeURIComponent(item)}`}
                      className="block px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 hover:pl-6"
                      style={{ fontSize: settings.font.contentSize }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
} 