import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NetworkConfig {
  name: string;
  smartContractAddress: string;
  policyId: string;
}

export function NetworkInfo({ selectedNetwork, onNetworkChange }: { 
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}) {
  const { data: networkConfigs = [] } = useQuery<NetworkConfig[]>({
    queryKey: ["/api/network-configs"],
  });

  const currentConfig = networkConfigs.find(config => config.name === selectedNetwork);

  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Network Information</CardTitle>
        <Select value={selectedNetwork} onValueChange={onNetworkChange}>
          <SelectTrigger className="w-[180px] h-9 bg-background/50 border-border/40">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {networkConfigs.map(config => (
              <SelectItem key={config.name} value={config.name}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {currentConfig ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Smart Contract Address</p>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="font-mono text-sm truncate">{currentConfig.smartContractAddress}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Policy ID</p>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <p className="font-mono text-sm truncate">{currentConfig.policyId}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a network to view details</p>
        )}
      </CardContent>
    </Card>
  );
}