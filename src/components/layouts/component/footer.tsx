"use client";

import Link from 'next/link';
import { Github, Twitter, MessagesSquare, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <Link 
              href="https://masumi.network" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link 
              href="https://docs.masumi.network" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="h-4 w-4 inline-block mr-1" />
              Docs
            </Link>
            <Link 
              href="https://nmkr.io/support" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Support
            </Link>
            <Link 
              href="https://masumi.network/terms" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms & Conditions
            </Link>
          </div>

          <div className="flex gap-4">
            <Link 
              href="https://x.com/MasumiNetwork" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link 
              href="https://discord.gg/aj4QfnTS92" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessagesSquare className="h-5 w-5" />
            </Link>
            <Link 
              href="https://github.com/masumi" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 