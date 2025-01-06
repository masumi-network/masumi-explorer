"use client";

import Link from 'next/link';
import { Github, Twitter, MessagesSquare, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#1F1F1F]">
      <div className="px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-6">
            <Link 
              href="https://masumi.network" 
              className="text-sm text-[#71717A] hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              href="https://docs.masumi.network" 
              className="text-sm text-[#71717A] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              Docs
            </Link>
            <Link 
              href="https://nmkr.io/support" 
              className="text-sm text-[#71717A] hover:text-white transition-colors"
            >
              Support
            </Link>
            <Link 
              href="https://masumi.network/terms" 
              className="text-sm text-[#71717A] hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="https://x.com/MasumiNetwork" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71717A] hover:text-white transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link 
              href="https://discord.gg/aj4QfnTS92" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71717A] hover:text-white transition-colors"
            >
              <MessagesSquare className="h-4 w-4" />
            </Link>
            <Link 
              href="https://github.com/masumi" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71717A] hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 