"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  MessageSquare, 
  ArrowLeft, 
  Check, 
  X,
  History,
  Activity,
  Shield,
  Trash
} from "lucide-react";
import Link from "next/link";
import { validateMetadata } from "@/lib/metadata-validator";
import { useWallet } from '@meshsdk/react';
import { 
  Transaction as MeshTransaction, 
  PlutusScript, 
  applyParamsToScript, 
  resolvePaymentKeyHash,
} from '@meshsdk/core';
import { blueprint } from "@/lib/plutus-minting-contract";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MetadataWarning } from "@/components/ui/metadata-warning";
import { cn } from "@/lib/utils";

// Add helper function if needed
const hexToString = (hex: string): string => {
  return Buffer.from(hex, 'hex').toString();
};

interface AgentDetails {
  asset: string;
  name: string;
  description: string;
  author: string;
  authorContact: string;
  organization: string;
  registeredAt: string;
  identityVerified: boolean;
  metadataCorrect: boolean;
  apiUrl?: string;
  capabilities?: string[];
  version?: string;
  lastActive?: string;
  totalRequests?: number;
  successRate?: number;
  policyId?: string;
  exampleOutput?: string;
  legal?: any;
  image?: string;
  rawMetadata?: any;
  amount: number;
  status: 'active' | 'retired';
  paymentAddress: string;
}

interface AssetData {
  policy_id: string;
  onchain_metadata?: {
    name?: string;
    description?: string;
    author?: {
      name?: string;
      contact?: string;
      organization?: string;
    };
    identity_verified?: boolean;
    api_url?: string;
    tags?: string[];
    version?: string;
    requests_per_hour?: number;
    example_output?: string;
    legal?: {
      "privacy policy": string;
      terms: string;
      other?: string;
    };
    image?: string;
    payment_address?: string;
  };
  initial_mint_tx_hash: string;
}

interface TxDetails {
  block_time: number;
}

// First, let's define the possible transaction states
type TransactionState = 
  | 'locked'           // Initial state after funds are locked
  | 'completed'        // Seller has unlocked with result
  | 'refundRequested'  // Buyer has requested refund
  | 'refundDenied'     // Seller has denied refund
  | 'refunded'         // Refund has been processed
  | 'disputed'         // Admin intervention needed
  ;

// Update Transaction interface
interface Transaction {
  txHash: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'refunded';
  referenceId: string;
  type: 'selling' | 'buying';
  buyerPkh: string;
  state: TransactionState;
  unlockTime: number;
  refundTime: number;
  actions: {
    canRequestRefund: boolean;
    canUnlock: boolean;
    canDenyRefund: boolean;
    canWithdrawRefund: boolean;
    canCancelRefundRequest: boolean;
    canDisputeRefund: boolean;
  };
}

// Make sure to set these values when creating a transaction
const createTransaction = (data: any): Transaction => {
  return {
    ...data,
    unlockTime: Date.now() + (60 * 60 * 1000), // 1 hour from now
    refundTime: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
    actions: {
      canRequestRefund: false,
      canUnlock: false,
      canDenyRefund: false,
      canWithdrawRefund: false,
      canCancelRefundRequest: false,
      canDisputeRefund: false,
    }
  };
};

export default function AgentDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, wallet } = useWallet();
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [deregistering, setDeregistering] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isDeregistering, setIsDeregistering] = useState(false);
  const [deregistrationTxHash, setDeregistrationTxHash] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [buyerTransactions, setBuyerTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!id) return;

      try {
        console.log('Fetching asset:', id);
        const assetData = await fetchFromBlockfrost(`/assets/${id}`);
        console.log('Asset data:', assetData);
        const txDetails = await fetchFromBlockfrost(`/txs/${assetData.initial_mint_tx_hash}`);
        console.log('Transaction details:', txDetails);

        const amount = parseInt(assetData.quantity || '0');

        setAgent({
          asset: id as string,
          name: assetData.onchain_metadata?.name || 'Unnamed Agent',
          description: assetData.onchain_metadata?.description || 'No description available',
          author: assetData.onchain_metadata?.author?.name || 'Unknown Author',
          authorContact: assetData.onchain_metadata?.author?.contact,
          organization: assetData.onchain_metadata?.author?.organization,
          registeredAt: new Date(txDetails.block_time * 1000).toLocaleString(),
          identityVerified: assetData.onchain_metadata?.identity_verified || false,
          metadataCorrect: validateMetadata(assetData.onchain_metadata),
          apiUrl: assetData.onchain_metadata?.api_url,
          capabilities: assetData.onchain_metadata?.tags || [],
          version: assetData.onchain_metadata?.version || '1.0.0',
          lastActive: new Date().toLocaleString(),
          totalRequests: assetData.onchain_metadata?.requests_per_hour || 0,
          successRate: 95 + Math.random() * 5,
          policyId: assetData.policy_id,
          exampleOutput: assetData.onchain_metadata?.example_output,
          legal: assetData.onchain_metadata?.legal,
          image: assetData.onchain_metadata?.image,
          rawMetadata: assetData.onchain_metadata,
          amount,
          status: amount > 0 ? 'active' : 'retired',
          paymentAddress: Array.isArray(assetData.onchain_metadata?.payment_address)
            ? assetData.onchain_metadata.payment_address.join('')
            : assetData.onchain_metadata?.payment_address || '',
        });
      } catch (error) {
        console.error('Error fetching agent details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (connected && agent) {
        try {
          const assets = await wallet.getAssets();
          setIsOwner(assets.some(asset => asset.unit === agent.asset));
        } catch (error) {
          console.error('Error checking ownership:', error);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [connected, wallet, agent]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!agent?.paymentAddress) return;

      try {
        addDebugInfo('Fetching transactions...');
        addDebugInfo(`Agent payment address: ${agent.paymentAddress}`);
        
        const scriptUtxos = await fetchFromBlockfrost(
          `/addresses/addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8/utxos`
        );
        addDebugInfo(`Found ${scriptUtxos.length} UTXOs at script address`);

        const agentTransactions = await Promise.all(
          scriptUtxos.map(async (utxo: any) => {
            try {
              addDebugInfo(`Processing UTXO: ${utxo.tx_hash}`);
              const tx = await fetchFromBlockfrost(`/txs/${utxo.tx_hash}/utxos`);
              
              const scriptOutput = tx.outputs.find((output: any) => 
                output.address === 'addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8'
              );

              if (!scriptOutput?.data_hash) {
                addDebugInfo(`No data hash found for tx ${utxo.tx_hash}`);
                return null;
              }
              addDebugInfo(`Found data hash: ${scriptOutput.data_hash}`);

              // Get the datum from Blockfrost
              addDebugInfo(`Fetching datum for hash: ${scriptOutput.data_hash}`);
              const datumResponse = await fetchFromBlockfrost(
                `/scripts/datum/${scriptOutput.data_hash}`
              );

              if (!datumResponse?.json_value) {
                addDebugInfo(`No datum found for hash ${scriptOutput.data_hash}`);
                return null;
              }

              const datum = datumResponse.json_value;
              addDebugInfo(`Datum fields: ${JSON.stringify(datum.fields, null, 2)}`);

              const sellerPkhFromDatum = datum.fields[1].bytes;
              const sellerPkhFromAddress = resolvePaymentKeyHash(agent.paymentAddress);

              addDebugInfo(`Seller PKH from datum: ${sellerPkhFromDatum}`);
              addDebugInfo(`Seller PKH from address: ${sellerPkhFromAddress}`);

              // Check if this transaction belongs to our agent
              if (sellerPkhFromDatum === sellerPkhFromAddress) {
                addDebugInfo(`Match found! Transaction belongs to this agent`);
                const txDetails = await fetchFromBlockfrost(`/txs/${utxo.tx_hash}`);
                
                const lovelaceAmount = scriptOutput.amount.find((a: any) => a.unit === 'lovelace');
                if (!lovelaceAmount) {
                  addDebugInfo(`No lovelace amount found in tx ${utxo.tx_hash}`);
                  return null;
                }
                addDebugInfo(`Amount: ${parseInt(lovelaceAmount.quantity) / 1000000} ADA`);

                const referenceId = Buffer.from(datum.fields[2].bytes, 'hex').toString('utf8');
                addDebugInfo(`Reference ID: ${referenceId}`);

                return {
                  txHash: utxo.tx_hash,
                  amount: lovelaceAmount.quantity,
                  timestamp: txDetails.block_time,
                  status: 'pending',
                  referenceId,
                  type: 'selling',
                  buyerPkh: datum.fields[0].bytes,
                  state: 'locked',
                  unlockTime: 0,
                  refundTime: 0,
                  actions: {
                    canRequestRefund: false,
                    canUnlock: false,
                    canDenyRefund: false,
                    canWithdrawRefund: false,
                    canCancelRefundRequest: false,
                    canDisputeRefund: false,
                  },
                };
              } else {
                addDebugInfo(`No match - different seller PKH`);
                addDebugInfo(`Datum PKH: ${sellerPkhFromDatum}`);
                addDebugInfo(`Address PKH: ${sellerPkhFromAddress}`);
              }

              return null;
            } catch (error) {
              addDebugInfo(`Error processing transaction ${utxo.tx_hash}: ${error}`);
              if (error instanceof Error) {
                addDebugInfo(`Error stack: ${error.stack}`);
              }
              return null;
            }
          })
        );

        const validTransactions = agentTransactions
          .filter(Boolean)
          .sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(validTransactions);
        addDebugInfo(`Found ${validTransactions.length} transactions for this agent`);
        if (validTransactions.length > 0) {
          addDebugInfo('Transaction details:');
          validTransactions.forEach(tx => {
            addDebugInfo(JSON.stringify(tx, null, 2));
          });
        }

      } catch (error) {
        console.error('Error fetching transactions:', error);
        addDebugInfo(`Error fetching transactions: ${error}`);
        if (error instanceof Error) {
          addDebugInfo(`Error stack: ${error.stack}`);
        }
      }
    };

    fetchTransactions();
  }, [agent?.paymentAddress]);

  useEffect(() => {
    const checkWalletTransactions = async () => {
      if (!connected || !wallet) return;
      
      try {
        const walletAddress = await wallet.getChangeAddress();
        const walletPkh = resolvePaymentKeyHash(walletAddress);
        addDebugInfo(`Checking transactions for wallet PKH: ${walletPkh}`);

        // Filter transactions where the wallet is the buyer
        const buyerTxs = transactions.filter(tx => tx.buyerPkh === walletPkh);
        setBuyerTransactions(buyerTxs);
      } catch (error) {
        console.error('Error checking wallet transactions:', error);
      }
    };

    checkWalletTransactions();
  }, [connected, wallet, transactions]);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`]);
  };

  const handleDeregister = async () => {
    if (!connected || !agent || !isOwner) return;
    
    try {
      setDeregistering(true);
      addDebugInfo('Starting deregistration process...');
      
      const POLICY_ID = 'c7842ba56912a2df2f2e1b89f8e11751c6ec2318520f4d312423a272';
      addDebugInfo(`Using official policy ID: ${POLICY_ID}`);
      
      const paymentContractAddress = 'addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8';
      
      // Find UTXO containing the token first
      const utxos = await wallet.getUtxos();
      addDebugInfo(`Found ${utxos.length} UTXOs`);
      
      if (utxos.length === 0) {
        throw new Error('No UTXOs found for the wallet');
      }

      // Log UTXO details
      utxos.forEach((utxo, index) => {
        addDebugInfo(`UTXO ${index + 1}:`);
        addDebugInfo(`  TxHash: ${utxo.input.txHash}`);
        addDebugInfo(`  OutputIndex: ${utxo.input.outputIndex}`);
        utxo.output.amount.forEach(amt => {
          addDebugInfo(`  Amount: ${amt.quantity} ${amt.unit}`);
        });
      });

      // Find the token UTXO using the correct policy ID
      const fullAssetId = `${POLICY_ID}${agent.asset.slice(56)}`;
      addDebugInfo(`Looking for asset: ${fullAssetId}`);

      const tokenUtxo = utxos.find(utxo => 
        utxo.output.amount.some(amt => amt.unit === fullAssetId)
      );

      if (!tokenUtxo) {
        throw new Error('Token not found in wallet');
      }
      addDebugInfo('Found token UTXO');

      const script: PlutusScript = {
        code: applyParamsToScript(blueprint.validators[0].compiledCode, [
          paymentContractAddress,
        ]),
        version: "V3"
      };

      const redeemer = {
        data: { alternative: 1, fields: [] },
        tag: 'BURN',
      };

      // Use the correct policy ID and asset name
      const assetName = agent.asset.slice(56);
      addDebugInfo(`Using Asset Name: ${assetName}`);

      // Create transaction with token UTXO
      const tx = new MeshTransaction({ initiator: wallet })
        .setTxInputs([tokenUtxo]);

      tx.isCollateralNeeded = true;

      // Setup burning
      addDebugInfo('Setting up token burning...');
      tx.txBuilder
        .mintPlutusScript(script.version)
        .mint('-1', POLICY_ID, assetName)
        .mintingScript(script.code)
        .mintRedeemerValue(redeemer.data, 'Mesh');

      const address = await wallet.getChangeAddress();
      addDebugInfo(`Change address: ${address}`);

      tx.sendLovelace(address, '5000000')
        .setRequiredSigners([address])
        .setChangeAddress(address);

      addDebugInfo('Transaction configured');

      // Build and submit
      addDebugInfo('Building transaction...');
      const unsignedTx = await tx.build();
      addDebugInfo('Transaction built');

      const signedTx = await wallet.signTx(unsignedTx, true);
      addDebugInfo('Transaction signed');

      const txHash = await wallet.submitTx(signedTx);
      setDeregistrationTxHash(txHash);
      addDebugInfo(`Transaction submitted: ${txHash}`);
      
      // Instead of redirecting, show deregistration status
      setIsDeregistering(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugInfo(`ERROR: ${errorMessage}`);
      console.error('Error deregistering agent:', error);
    } finally {
      setDeregistering(false);
    }
  };

  // Helper function to determine available actions
  const getTransactionActions = (
    tx: Transaction,
    isBuyer: boolean,
    isSeller: boolean,
    isAdmin: boolean,
    currentTime: number
  ) => {
    const actions = {
      canRequestRefund: false,
      canUnlock: false,
      canDenyRefund: false,
      canWithdrawRefund: false,
      canCancelRefundRequest: false,
      canDisputeRefund: false,
    };

    switch (tx.state) {
      case 'locked':
        actions.canUnlock = isSeller;
        actions.canRequestRefund = isBuyer && currentTime > tx.unlockTime;
        break;
      case 'refundRequested':
        actions.canDenyRefund = isSeller;
        actions.canWithdrawRefund = isBuyer && currentTime > tx.refundTime;
        actions.canCancelRefundRequest = isBuyer;
        break;
      case 'refundDenied':
        actions.canDisputeRefund = isBuyer;
        actions.canWithdrawRefund = isAdmin;
        break;
    }

    return actions;
  };

  // Update the transaction card component
  const TransactionCard = ({ 
    tx, 
    isBuyer, 
    isSeller, 
    isAdmin 
  }: { 
    tx: Transaction;
    isBuyer: boolean;
    isSeller: boolean;
    isAdmin: boolean;
  }) => {
    const currentTime = Date.now();
    const actions = getTransactionActions(tx, isBuyer, isSeller, isAdmin, currentTime);

    return (
      <Card key={tx.txHash} className={cn(
        "p-4",
        isBuyer && "border-primary/20"
      )}>
        <div className="space-y-4">
          {/* Transaction Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Reference ID: {tx.referenceId}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(tx.timestamp * 1000).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{parseInt(tx.amount) / 1000000} ADA</p>
            </div>
          </div>

          {/* Transaction State */}
          <div className="flex items-center gap-2">
            <Badge variant={
              tx.state === 'completed' ? 'default' :
              tx.state === 'refunded' ? 'destructive' :
              tx.state === 'disputed' ? 'destructive' :
              'secondary'
            }>
              {tx.state}
            </Badge>
            {isBuyer && <Badge variant="outline">Your Transaction</Badge>}
            {isSeller && <Badge variant="outline">Your Agent</Badge>}
          </div>

          {/* Transaction Timeline */}
          <div className="relative pl-4 border-l border-muted">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="absolute left-0 w-2 h-2 -translate-x-[5px] rounded-full bg-primary" />
                <p className="text-sm">Funds Locked</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.timestamp * 1000).toLocaleString()}
                </p>
              </div>
              {tx.state !== 'locked' && (
                <div className="flex items-center gap-2">
                  <div className="absolute left-0 w-2 h-2 -translate-x-[5px] rounded-full bg-primary" />
                  <p className="text-sm">{
                    tx.state === 'completed' ? 'Result Provided' :
                    tx.state === 'refundRequested' ? 'Refund Requested' :
                    tx.state === 'refundDenied' ? 'Refund Denied' :
                    tx.state === 'refunded' ? 'Refunded' :
                    tx.state === 'disputed' ? 'Disputed' : ''
                  }</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Next Steps:</p>
            {Object.entries(actions).map(([action, canDo]) => 
              canDo && (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {/* Implement action handlers */}}
                >
                  {action.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              )
            )}
            {!Object.values(actions).some(Boolean) && (
              <p className="text-sm text-muted-foreground">
                No actions available
              </p>
            )}
          </div>

          {/* Time Information */}
          {tx.state === 'locked' && (
            <div className="text-sm text-muted-foreground">
              {currentTime < tx.unlockTime ? (
                <>Refund available in {Math.ceil((tx.unlockTime - currentTime) / 1000 / 60)} minutes</>
              ) : (
                <>Refund available now</>
              )}
            </div>
          )}
          {tx.state === 'refundRequested' && (
            <div className="text-sm text-muted-foreground">
              {currentTime < tx.refundTime ? (
                <>Auto-refund in {Math.ceil((tx.refundTime - currentTime) / 1000 / 60)} minutes</>
              ) : (
                <>Auto-refund available now</>
              )}
            </div>
          )}

          {/* Transaction Link */}
          <div className="text-right">
            <Link 
              href={`https://preprod.cardanoscan.io/transaction/${tx.txHash}`}
              target="_blank"
              className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
            >
              View Transaction
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading agent details...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Agent not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-semibold">{agent.name}</h1>
                <p className="text-sm text-muted-foreground">Version {agent.version}</p>
              </div>
              {isOwner && (
                <Badge variant="secondary">
                  Owned by you
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button 
                variant="destructive" 
                onClick={handleDeregister}
                disabled={deregistering}
                className="gap-2"
              >
                {deregistering ? (
                  <>Deregistering...</>
                ) : (
                  <>
                    <Trash className="h-4 w-4" />
                    Deregister Agent
                  </>
                )}
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  {agent.metadataCorrect ? (
                    <Link href={`/agents/${id}/interact`}>
                      <Button className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Interact with Agent
                      </Button>
                    </Link>
                  ) : (
                    <Button className="gap-2" disabled>
                      <MessageSquare className="h-4 w-4" />
                      Interact with Agent
                    </Button>
                  )}
                </span>
              </TooltipTrigger>
              {!agent.metadataCorrect && (
                <TooltipContent>
                  <p>Interaction disabled: Metadata standards not met</p>
                </TooltipContent>
              )}
            </Tooltip>
            <Link 
              href={`https://preprod.cardanoscan.io/token/${agent.asset}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        {!agent.metadataCorrect && (
          <div className="mb-4">
            <MetadataWarning />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-7">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="p-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium mb-2">About</h2>
                  <p className="text-muted-foreground">{agent.description}</p>
                </div>

                {agent.metadataCorrect && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Author Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{agent.author}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Organization</p>
                        <p className="font-medium">{agent.organization}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium">{agent.authorContact}</p>
                      </div>
                    </div>
                  </div>
                )}

                {agent.metadataCorrect && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Technical Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">API URL</p>
                        <p className="font-medium font-mono">{agent.apiUrl}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requests per Hour</p>
                        <p className="font-medium">{agent.totalRequests}</p>
                      </div>
                    </div>
                  </div>
                )}

                {agent.metadataCorrect && agent.capabilities && agent.capabilities.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {agent.metadataCorrect && agent.legal && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Legal Documentation</h2>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Privacy Policy</p>
                        <Link 
                          href={agent.legal["privacy policy"]} 
                          target="_blank" 
                          className="text-primary hover:underline"
                        >
                          View Policy
                        </Link>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Terms of Service</p>
                        <Link 
                          href={agent.legal.terms} 
                          target="_blank" 
                          className="text-primary hover:underline"
                        >
                          View Terms
                        </Link>
                      </div>
                      {agent.legal.other && (
                        <div>
                          <p className="text-sm text-muted-foreground">Additional Documentation</p>
                          <Link 
                            href={agent.legal.other} 
                            target="_blank" 
                            className="text-primary hover:underline"
                          >
                            View Documentation
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {agent.metadataCorrect && agent.exampleOutput && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Example Output</h2>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-mono text-sm break-all">{agent.exampleOutput}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <Activity className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Requests per Hour</p>
                    <p className="text-2xl font-semibold">{agent.totalRequests?.toLocaleString()}</p>
                  </Card>
                  <Card className="p-4">
                    <Shield className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-semibold">{agent.successRate?.toFixed(1)}%</p>
                  </Card>
                  <Card className="p-4">
                    <History className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Last Active</p>
                    <p className="text-sm font-medium">{agent.lastActive}</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-6">
                  {/* Transactions where this agent is the seller */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">Agent Transactions</h2>
                    <div className="space-y-4">
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <TransactionCard 
                            key={tx.txHash} 
                            tx={tx} 
                            isBuyer={false} 
                            isSeller={true} 
                            isAdmin={false} 
                          />
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No transactions found for this agent
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transactions where the connected wallet is the buyer */}
                  {connected && buyerTransactions.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium mb-4">Your Interactions</h2>
                      <div className="space-y-4">
                        {buyerTransactions.map((tx) => (
                          <TransactionCard 
                            key={tx.txHash} 
                            tx={tx} 
                            isBuyer={true} 
                            isSeller={false} 
                            isAdmin={false} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Author</dt>
                <dd className="text-sm font-medium">{agent.author}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Registered</dt>
                <dd className="text-sm font-medium">{agent.registeredAt}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Policy ID</dt>
                <dd className="text-sm font-mono break-all">{agent.policyId}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Asset ID</dt>
                <dd className="text-sm font-mono break-all">{agent.asset}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="text-sm font-medium">
                  <Badge 
                    variant={agent.status === 'active' ? 'default' : 'secondary'}
                    className={agent.status === 'retired' ? 'opacity-50' : ''}
                  >
                    {agent.status === 'active' ? 'Active' : 'Retired'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Payment Address</dt>
                <dd className="text-sm font-mono break-all">{agent.paymentAddress}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Verification</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Identity Verified</span>
                {agent.identityVerified ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Metadata Correct</span>
                {agent.metadataCorrect ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </Card>

          {/* Debug Information */}
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

      {isDeregistering && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Agent Deregistration in Progress</h3>
          <p className="text-sm text-yellow-700">
            This agent is being deregistered. This process may take a few minutes to complete.
            {deregistrationTxHash && (
              <>
                <br />
                Transaction: <Link 
                  href={`https://preprod.cardanoscan.io/transaction/${deregistrationTxHash}`}
                  target="_blank"
                  className="underline"
                >
                  View on Cardanoscan
                </Link>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
} 