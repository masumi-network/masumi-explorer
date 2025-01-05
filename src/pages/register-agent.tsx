"use client";

import { useState } from "react";
import RegisterSection from "@/components/dashboard/register/register-section";
import { blueprint } from "@/lib/plutus-minting-contract";

export default function RegisterAgent() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`]);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Register New Agent</h1>
        <p className="text-muted-foreground">Add your AI agent to the Masumi registry</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <RegisterSection addDebugInfo={addDebugInfo} />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Debug Information */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Debug Information</h3>
            <div className="text-xs font-mono text-muted-foreground max-h-[400px] overflow-y-auto whitespace-pre-wrap">
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))}
            </div>
          </div>

          {/* Metadata Template */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Metadata Template</h3>
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
              {`Metadata Template:
{
  "<policy id>": {
    "<asset_name>": {
      "name": "<name>",
      "description": "<description>",
      "api_url": "<api_url>",
      "example_output": "<ipfs_hash>",
      "version": "<version>",
      "author": {
        "name": "<author_name>",
        "contact": "<author_contact_details>",
        "organization": "<author_orga>"
      },
      "payment_address": "<cardano_address>",
      "requests_per_hour": "request_amount",
      "tags": [
        "<tag>"
      ],
      "legal": {
        "privacy policy": "<url>",
        "terms": "<url>",
        "other": "<url>"
      },
      "image": "http://example.com/path/to/image.png"
    }
  },
  "version": "1.0"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}