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
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Network Information</CardTitle>
        <Select value={selectedNetwork} onValueChange={onNetworkChange}>
          <SelectTrigger className="w-[180px]">
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
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Smart Contract Address</p>
              <p className="font-mono text-sm">{currentConfig.smartContractAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Policy ID</p>
              <p className="font-mono text-sm">{currentConfig.policyId}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a network to view details</p>
        )}
      </CardContent>
    </Card>
  );
}
