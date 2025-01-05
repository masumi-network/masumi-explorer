"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWallet } from '@meshsdk/react';
import { 
  Transaction, 
  PlutusScript,
  resolvePlutusScriptAddress,
  resolvePaymentKeyHash,
  mBool,
  applyParamsToScript 
} from '@meshsdk/core';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, AlertCircle } from "lucide-react";
import { paymentBlueprint } from "@/lib/plutus-payment-contract";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import Link from "next/link";
import { validateMetadata } from "@/lib/metadata-validator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Admin addresses
const ADMIN_ADDRESSES = [
  'addr_test1qrgpga399l0r8fg7n0jfshhxsjl26w0uslxf5m02yclur8mremst4rk8xsz9lx78e9sdtjfsyj3c9kll2c4958uhkals2qrm9q',
  'addr_test1qqturqflellkrv0kcg9guuzkk8wx5yaytpsfcd3mmvemg0v7akaxvzel56ls59kw2fs20ckxhs09365medeen6tyy0pqkx3hku',
  'addr_test1qz93vk0v6jcy4n8g4w3srqkjmcy6ryw90gngx0llvyek5rsc665n90486m4vvue3c2dsjg8sw3tchkjzgxgp4y77rkxqgxjd2h'
];

interface AgentDetails {
  name: string;
  paymentAddress: string;
}

interface PaymentFormData {
  referenceId: string;
  amount: string;
}

export default function InteractWithAgent() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    referenceId: '',
    amount: '50'
  });
  const [txHash, setTxHash] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`]);
  };

  useEffect(() => {
    const checkMetadata = async () => {
      if (!id) return;

      try {
        addDebugInfo('Checking metadata validity...');
        const assetData = await fetchFromBlockfrost(`/assets/${id}`);
        addDebugInfo('Fetched asset data');
        const isValid = validateMetadata(assetData.onchain_metadata);
        addDebugInfo(`Metadata validation result: ${isValid ? 'Valid' : 'Invalid'}`);
        
        if (!isValid) {
          addDebugInfo('Invalid metadata, redirecting to agent details');
          router.push(`/agents/${id}`);
        }
      } catch (error) {
        addDebugInfo(`Error checking metadata: ${error}`);
        router.push(`/agents/${id}`);
      }
    };

    checkMetadata();
  }, [id, router]);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!id) return;

      try {
        addDebugInfo('Fetching agent details...');
        const assetData = await fetchFromBlockfrost(`/assets/${id}`);
        addDebugInfo('Agent data fetched');
        
        const paymentAddress = Array.isArray(assetData.onchain_metadata?.payment_address)
          ? assetData.onchain_metadata.payment_address.join('')
          : assetData.onchain_metadata?.payment_address || '';
        
        addDebugInfo(`Payment address resolved: ${paymentAddress.slice(0, 20)}...`);

        setAgent({
          name: assetData.onchain_metadata?.name || 'Unnamed Agent',
          paymentAddress
        });
      } catch (error) {
        addDebugInfo(`Error fetching agent details: ${error}`);
      }
    };

    fetchAgentDetails();
  }, [id]);

  const handlePayment = async () => {
    if (!connected || !wallet) {
      addDebugInfo('Payment attempted without wallet connection');
      return;
    }
    
    try {
      setLoading(true);
      addDebugInfo('Starting payment process...');

      // Check for UTXOs
      const utxos = await wallet.getUtxos();
      if (utxos.length === 0) {
        throw new Error('No UTXOs found in the wallet. Wallet is empty.');
      }
      addDebugInfo(`Found ${utxos.length} UTXOs`);

      // Get buyer's address and key hash
      const buyerAddress = await wallet.getChangeAddress();
      addDebugInfo(`Buyer address: ${buyerAddress}`);
      const buyerVerificationKeyHash = resolvePaymentKeyHash(buyerAddress);
      addDebugInfo(`Buyer verification key hash: ${buyerVerificationKeyHash}`);

      // Get seller's address and key hash
      const sellerAddress = agent?.paymentAddress || '';
      if (!sellerAddress) {
        throw new Error('No payment address found for this agent');
      }
      addDebugInfo(`Seller address: ${sellerAddress}`);
      const sellerVerificationKeyHash = resolvePaymentKeyHash(sellerAddress);
      addDebugInfo(`Seller verification key hash: ${sellerVerificationKeyHash}`);

      // Create script with only admin addresses
      addDebugInfo('Creating payment script with admin addresses...');
      const script: PlutusScript = {
        code: applyParamsToScript(paymentBlueprint.validators[0].compiledCode, [
          [
            resolvePaymentKeyHash(ADMIN_ADDRESSES[0]),
            resolvePaymentKeyHash(ADMIN_ADDRESSES[1]),
            resolvePaymentKeyHash(ADMIN_ADDRESSES[2]),
          ],
        ]),
        version: 'V3'
      };

      // Calculate times
      const unlockTime = Date.now() + 1000 * 60 * 30; // 30 minutes
      const refundTime = Date.now() + 1000 * 60 * 60; // 1 hour

      addDebugInfo(`Contract parameters:
        Reference ID: ${formData.referenceId}
        Unlock Time: ${new Date(unlockTime).toISOString()}
        Refund Time: ${new Date(refundTime).toISOString()}
        Amount: ${formData.amount} ADA
      `);

      // Create datum with transaction details
      const datum = {
        value: {
          alternative: 0,
          fields: [
            buyerVerificationKeyHash,
            sellerVerificationKeyHash,
            formData.referenceId,
            '',
            unlockTime,
            refundTime,
            mBool(true),
            mBool(false),
          ],
        },
        inline: true,
      };

      addDebugInfo('Created datum structure:');
      addDebugInfo(JSON.stringify({
        buyerVerificationKeyHash,
        sellerVerificationKeyHash,
        referenceId: formData.referenceId,
        resultHash: '',
        unlockTime: new Date(unlockTime).toISOString(),
        refundTime: new Date(refundTime).toISOString(),
        refundRequested: true,
        refundDenied: false
      }, null, 2));
      addDebugInfo('Raw datum:');
      addDebugInfo(JSON.stringify(datum, null, 2));

      addDebugInfo('Building transaction...');
      const scriptAddress = resolvePlutusScriptAddress(script, 0);
      addDebugInfo(`Script address: ${scriptAddress}`);

      // Build transaction
      const tx = new Transaction({ initiator: wallet })
        .sendLovelace(
          {
            address: scriptAddress,
            datum,
          },
          `${parseInt(formData.amount) * 1000000}`,
        );

      addDebugInfo('Building unsigned transaction...');
      const unsignedTx = await tx.build();
      addDebugInfo('Transaction built');

      addDebugInfo('Signing transaction...');
      const signedTx = await wallet.signTx(unsignedTx);
      addDebugInfo('Transaction signed');

      addDebugInfo('Submitting transaction...');
      const hash = await wallet.submitTx(signedTx);
      addDebugInfo(`Transaction submitted with hash: ${hash}`);
      
      setTxHash(hash);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugInfo(`ERROR: ${errorMessage}`);
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!agent) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Verifying agent metadata...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Interact with {agent?.name}</h1>
        <p className="text-muted-foreground">Make a payment to use this agent</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              1. Enter a reference ID for your interaction
              <br />
              2. Choose the amount to pay (minimum 50 ADA)
              <br />
              3. Your payment will be held in a smart contract
              <br />
              4. The agent provider has 30 minutes to fulfill your request
              <br />
              5. You can request a refund if not satisfied
            </AlertDescription>
          </Alert>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="referenceId">Reference ID</Label>
                <Input
                  id="referenceId"
                  value={formData.referenceId}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    referenceId: e.target.value 
                  }))}
                  placeholder="Enter a reference ID for this interaction"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This ID will be used to track your interaction
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount (ADA)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amount: e.target.value 
                  }))}
                  min="50"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum amount is 50 ADA
                </p>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={loading || !connected || !agent?.paymentAddress}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Make Payment'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Payment Details</h2>
            {agent?.paymentAddress ? (
              <div className="space-y-4">
                <div>
                  <Label>Payment Address</Label>
                  <p className="text-sm font-mono break-all mt-1">
                    {agent.paymentAddress}
                  </p>
                </div>
                <div>
                  <Label>Contract Terms</Label>
                  <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                    <li>30 minute fulfillment window</li>
                    <li>1 hour refund dispute period</li>
                    <li>Protected by smart contract</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Loading payment details...
              </p>
            )}
          </Card>

          {txHash && (
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Transaction Status</h2>
              <div className="space-y-2">
                <p className="text-sm text-green-600">Payment Successful!</p>
                <p className="text-xs text-muted-foreground break-all">
                  Transaction: {txHash}
                </p>
                <Link 
                  href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View on Cardanoscan
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Debug Information</h2>
            <div className="space-y-2 text-xs font-mono max-h-[400px] overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-muted-foreground">
                  {info}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 