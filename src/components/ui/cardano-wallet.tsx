"use client";

import { CardanoWallet } from '@meshsdk/react';
import { useWallet } from '@meshsdk/react';

export function CustomCardanoWallet() {
  const { connected } = useWallet();

  return (
    <>
      <style>{`
        .mesh-connect-wallet {
          background: transparent;
          border: 1px solid rgb(63 63 70);
          color: rgb(161 161 170);
          font-size: 0.875rem;
          line-height: 1.25rem;
          height: 2.5rem;
          padding-left: 1rem;
          padding-right: 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition-property: color, background-color, border-color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .mesh-connect-wallet:hover {
          background-color: rgb(39 39 42);
          border-color: rgb(82 82 91);
          color: white;
        }

        .mesh-modal {
          background: rgb(24 24 27);
          border: 1px solid rgb(63 63 70);
          border-radius: 0.5rem;
          color: white;
        }

        .mesh-modal button {
          background: transparent;
          border: 1px solid rgb(63 63 70);
          color: rgb(161 161 170);
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: all 150ms;
        }

        .mesh-modal button:hover {
          background-color: rgb(39 39 42);
          border-color: rgb(82 82 91);
          color: white;
        }
      `}</style>
      <CardanoWallet />
    </>
  );
} 