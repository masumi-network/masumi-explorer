"use client";

import { CardanoWallet } from '@meshsdk/react';
import { useWallet } from '@meshsdk/react';
import { 
  Transaction,
  PlutusScript,
  applyParamsToScript,
} from '@meshsdk/core';
import { deserializePlutusScript } from '@meshsdk/core-cst';
import { blake2b } from 'ethereum-cryptography/blake2b.js';
import { blueprint } from "@/lib/plutus-minting-contract";  // Updated import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useState } from 'react';
import { validateMetadata } from "@/lib/metadata-validator";

interface MetadataFields {
  name: string;
  description: string;
  api_url: string;
  example_output: string;
  version: string;
  author: {
    name: string;
    contact: string;
    organization: string;
  };
  requests_per_hour: number;
  tags: string[];
  legal: {
    "privacy policy": string;
    terms: string;
    other?: string;
  };
  image: string;
  paymentAddress: string;
}

// Helper function to split long strings
function splitLongString(str: string, maxLength: number = 64): string[] {
  const chunks: string[] = [];
  let remaining = str;
  while (remaining.length > 0) {
    // Try to split at a space if possible
    let splitPoint = maxLength;
    if (remaining.length > maxLength) {
      const lastSpace = remaining.slice(0, maxLength).lastIndexOf(' ');
      if (lastSpace > 0) {
        splitPoint = lastSpace;
      }
    }
    chunks.push(remaining.slice(0, splitPoint));
    remaining = remaining.slice(splitPoint).trim();
  }
  return chunks;
}

interface RegisterSectionProps {
  addDebugInfo: (info: string) => void;
}

interface FormData {
  name: string;
  description: string;
  api_url: string;
  example_output: string;
  version: string;
  author: {
    name: string;
    contact: string;
    organization: string;
  };
  requests_per_hour: number;
  tags: string[];
  legal: {
    "privacy policy": string;
    terms: string;
    other?: string;
  };
  image: string;
  paymentAddress: string;
}

export default function RegisterSection({ addDebugInfo }: RegisterSectionProps) {
  const { wallet, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [canMint, setCanMint] = useState(true);
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
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

  const handleChange = (parent: string, child: string, value: string | number) => {
    setFormData((prev) => {
      // Handle nested objects (author, legal)
      if (parent === 'author' || parent === 'legal') {
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      
      // Handle top-level fields
      return {
        ...prev,
        [parent]: value
      };
    });
  };

  const formatPaymentAddress = (address: string): string | string[] => {
    if (address.length <= 64) {
      return address;
    }
    // Split into chunks of 64 characters
    const chunks: string[] = [];
    for (let i = 0; i < address.length; i += 64) {
      chunks.push(address.slice(i, i + 64));
    }
    return chunks;
  };

  const mintAsset = async () => {
    if (!canMint) {
      alert('Please wait for the previous transaction to confirm (about 20-30 seconds)');
      return;
    }

    try {
      setLoading(true);
      setCanMint(false);

      const paymentContractAddress = 'addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8';

      const script: PlutusScript = {
        code: applyParamsToScript(blueprint.validators[0].compiledCode, [
          paymentContractAddress,
        ]),
        version: "V3"
      };

      // Get all UTXOs
      const utxos = await wallet.getUtxos();
      if (utxos.length === 0) {
        throw new Error('No UTXOs found for the specified wallet');
      }

      // Find a suitable UTXO for the transaction
      const suitableUtxo = utxos.find(utxo => {
        const lovelaceAmount = utxo.output.amount.find(amt => amt.unit === 'lovelace');
        const hasOnlyAda = utxo.output.amount.length === 1;
        const minRequired = BigInt(25_000_000); // 25 ADA
        const isEnough = lovelaceAmount && BigInt(lovelaceAmount.quantity) > minRequired;
        
        return lovelaceAmount && isEnough && hasOnlyAda;
      });

      if (!suitableUtxo) {
        throw new Error('No suitable UTXO found. Need at least 25 ADA in a single UTXO with no tokens.');
      }

      const txId = suitableUtxo.input.txHash;
      const txIndex = suitableUtxo.input.outputIndex;
      const serializedOutput = txId + txIndex.toString(16).padStart(8, '0');

      const serializedOutputUint8Array = new Uint8Array(
        Buffer.from(serializedOutput, 'hex')
      );
      const blake2b256 = blake2b(serializedOutputUint8Array, 32);
      const assetName = Buffer.from(blake2b256).toString('hex');

      const redeemer = {
        data: { alternative: 0, fields: [] },
        tag: 'MINT',
      };

      const policyId = deserializePlutusScript(script.code, script.version)
        .hash()
        .toString();

      // Let the wallet handle collateral
      const tx = new Transaction({ initiator: wallet })
        .setTxInputs([suitableUtxo]);

      tx.isCollateralNeeded = true;

      tx.txBuilder
        .mintPlutusScript(script.version)
        .mint('1', policyId, assetName)
        .mintingScript(script.code)
        .mintRedeemerValue(redeemer.data, 'Mesh');

      const metadata = {
        [policyId]: {
          [assetName]: {
            name: formData.name,
            description: splitLongString(formData.description),
            api_url: formData.api_url,
            example_output: formData.example_output,
            version: formData.version,
            author: {
              name: formData.author.name,
              contact: formData.author.contact,
              organization: formData.author.organization,
            },
            requests_per_hour: formData.requests_per_hour,
            tags: formData.tags,
            legal: {
              "privacy policy": formData.legal["privacy policy"],
              terms: formData.legal.terms,
              other: formData.legal.other,
            },
            image: formData.image,
            payment_address: formatPaymentAddress(formData.paymentAddress),
          },
        },
        version: "1.0"
      };

      tx.setMetadata(721, metadata);

      const address = await wallet.getChangeAddress();
      
      tx.setRequiredSigners([address])
        .setChangeAddress(address)
        .sendLovelace(address, '15000000')
        .sendAssets(address, [{ unit: policyId + assetName, quantity: '1' }]);

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx, true);
      const txHash = await wallet.submitTx(signedTx);

      setPendingTxHash(txHash);
      
      setTimeout(() => {
        setCanMint(true);
        setPendingTxHash(null);
      }, 60000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';
      console.error('Error minting asset:', error);
      setCanMint(true);
      setPendingTxHash(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-12 lg:col-span-6">
      <div className="p-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium mb-2">Register Agent</h2>
          <p className="text-sm text-muted-foreground">Register a new agent on Masumi</p>
        </div>
      </div>

      <div className="p-6 pt-0">
        {!connected ? (
          <div className="mb-4 p-4 bg-muted text-muted-foreground rounded-md">
            Please connect your wallet to register an agent
          </div>
        ) : pendingTxHash ? (
          <div className="mb-4 p-4 bg-muted text-muted-foreground rounded-md">
            Transaction pending: {pendingTxHash}
            <br />
            Please wait for confirmation before registering another agent.
          </div>
        ) : null}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label>Agent Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', '', e.target.value)}
                placeholder="My AI Agent"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', '', e.target.value)}
                placeholder="Describe what your agent does..."
              />
            </div>

            <div>
              <Label>Version</Label>
              <Input
                value={formData.version}
                onChange={(e) => handleChange('version', '', e.target.value)}
                placeholder="1.0.0"
              />
            </div>
          </div>

          {/* Author Information */}
          <div className="space-y-4">
            <div>
              <Label>Author Name</Label>
              <Input
                value={formData.author.name}
                onChange={(e) => handleChange('author', 'name', e.target.value)}
              />
            </div>

            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={formData.author.contact}
                onChange={(e) => handleChange('author', 'contact', e.target.value)}
              />
            </div>

            <div>
              <Label>Organization</Label>
              <Input
                value={formData.author.organization}
                onChange={(e) => handleChange('author', 'organization', e.target.value)}
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <div>
              <Label>API Endpoint</Label>
              <Input
                value={formData.api_url}
                onChange={(e) => handleChange('api_url', '', e.target.value)}
                placeholder="https://api.example.com/agent"
              />
            </div>

            <div>
              <Label>Example Output (IPFS Hash)</Label>
              <Input
                value={formData.example_output}
                onChange={(e) => handleChange('example_output', '', e.target.value)}
                placeholder="QmXyz..."
              />
            </div>

            <div>
              <Label>Requests per Hour</Label>
              <Input
                type="number"
                value={formData.requests_per_hour}
                onChange={(e) => handleChange('requests_per_hour', '', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Legal & Documentation */}
          <div className="space-y-4">
            <div>
              <Label>Privacy Policy URL</Label>
              <Input
                value={formData.legal["privacy policy"]}
                onChange={(e) => handleChange('legal', 'privacy policy', e.target.value)}
                placeholder="https://example.com/privacy"
              />
            </div>

            <div>
              <Label>Terms of Service URL</Label>
              <Input
                value={formData.legal.terms}
                onChange={(e) => handleChange('legal', 'terms', e.target.value)}
                placeholder="https://example.com/terms"
              />
            </div>

            <div>
              <Label>Other Legal Documentation (Optional)</Label>
              <Input
                value={formData.legal.other}
                onChange={(e) => handleChange('legal', 'other', e.target.value)}
                placeholder="https://example.com/other"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentAddress">Payment Address</Label>
              <Input
                id="paymentAddress"
                value={formData.paymentAddress}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  paymentAddress: e.target.value 
                }))}
                placeholder="Enter the Cardano address that will receive payments"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This address will receive payments when users interact with your agent
              </p>
            </div>
          </div>

          <Button 
            onClick={mintAsset} 
            disabled={!connected || loading || !canMint}
            className="w-full"
          >
            {loading ? 'Processing...' : !canMint ? 'Waiting for confirmation...' : 'Register Agent'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 