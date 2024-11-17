import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import { Info } from "lucide-react"
  import { Agent } from "@/types/agent"
  import { ScrollArea } from "@/components/ui/scroll-area"
  
  interface MetadataDialogProps {
    agent: Agent;
  }
  
  export function MetadataDialog({ agent }: MetadataDialogProps) {
    // Function to format metadata for display
    const formatValue = (value: any): string => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    };
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {agent.onchain_metadata?.name || 'Agent Metadata'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 h-[500px]">
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">Asset ID</p>
                    <p className="text-muted-foreground break-all">{agent.asset}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Policy ID</p>
                    <p className="text-muted-foreground break-all">{agent.policy_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Fingerprint</p>
                    <p className="text-muted-foreground">{agent.fingerprint}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Quantity</p>
                    <p className="text-muted-foreground">{agent.quantity}</p>
                  </div>
                </div>
              </div>
  
              {/* Onchain Metadata */}
              {agent.onchain_metadata && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Onchain Metadata</h4>
                  <div className="space-y-4">
                    {Object.entries(agent.onchain_metadata).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-sm font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <pre className="text-sm text-muted-foreground bg-muted p-2 rounded-md overflow-x-auto">
                          {formatValue(value)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Additional Info */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Transaction Information</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Initial Mint Transaction</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {agent.initial_mint_tx_hash}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mint/Burn Count</p>
                    <p className="text-sm text-muted-foreground">
                      {agent.mint_or_burn_count}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }