"use client";

import { useState } from "react";
import RegisterSection from "@/components/dashboard/register/register-section";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

// Helper function to split long strings
function formatLongString(value: string): string | string[] {
  if (value.length <= 64) return value;
  
  const chunks: string[] = [];
  let remaining = value;
  while (remaining.length > 0) {
    // Try to split at a space if possible
    let splitPoint = 64;
    if (remaining.length > 64) {
      const lastSpace = remaining.slice(0, 64).lastIndexOf(' ');
      if (lastSpace > 0) {
        splitPoint = lastSpace;
      }
    }
    chunks.push(remaining.slice(0, splitPoint));
    remaining = remaining.slice(splitPoint).trim();
  }
  return chunks;
}

// Helper function to format metadata
function formatMetadata(data: any): any {
  if (typeof data === 'string') {
    return formatLongString(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => formatMetadata(item));
  }
  if (typeof data === 'object' && data !== null) {
    const formatted: any = {};
    for (const [key, value] of Object.entries(data)) {
      formatted[key] = formatMetadata(value);
    }
    return formatted;
  }
  return data;
}

export default function RegisterAgent() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Test AI Assistant',
    description: 'A powerful AI assistant that helps with natural language processing, code generation, and general knowledge queries. Specialized in Cardano blockchain technology.',
    api_url: 'https://api.masumi.network/agents/test-assistant',
    example_output: 'QmX7bJqhS7XQMnX3qhV5Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z',
    version: '1.0.0',
    author: {
      name: 'John Doe',
      contact: 'john@example.com',
      organization: 'Masumi Labs',
    },
    requests_per_hour: 1000,
    tags: ['AI', 'NLP', 'Code Generation', 'Cardano'],
    legal: {
      "privacy policy": 'https://masumi.network/privacy',
      terms: 'https://masumi.network/terms',
      other: 'https://masumi.network/legal',
    },
    image: 'https://masumi.network/images/test-assistant.png',
    paymentAddress: '',
  });

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`]);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-7">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold text-zinc-100">Register New Agent</h1>
        </div>
        <p className="text-zinc-500 text-lg max-w-3xl">
          Add your AI agent to the Masumi registry and join the decentralized marketplace for AI services.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <RegisterSection 
            addDebugInfo={addDebugInfo} 
            onFormChange={setFormData}
            formData={formData}
          />
        </div>

        {/* Metadata Preview */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-zinc-100">Metadata Preview</h3>
              <p className="text-sm text-zinc-500">Live preview of your agent's metadata</p>
            </div>
            <div className="space-y-4">
              <pre className="text-xs font-mono text-zinc-400 overflow-x-auto rounded-lg bg-black/20 p-4">
                {JSON.stringify(formatMetadata(formData), null, 2)}
              </pre>
            </div>
          </Card>

          {/* Debug Information - Collapsible */}
          <Collapsible 
            open={isDebugOpen} 
            onOpenChange={setIsDebugOpen}
            className="bg-zinc-900/50 rounded-lg border border-zinc-800"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 text-zinc-400 hover:text-zinc-100"
              >
                <span className="text-sm font-medium">Debug Information</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDebugOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="text-xs font-mono text-zinc-500 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                {debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">{info}</div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}