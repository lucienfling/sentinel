import { useGetIntegrations, useUpdateIntegration } from "@workspace/api-client-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getGetIntegrationsQueryKey } from "@workspace/api-client-react";

export default function Integrations() {
  const { data: integrations } = useGetIntegrations();
  const updateIntegration = useUpdateIntegration();
  const queryClient = useQueryClient();

  const handleToggle = (id: string, isConnected: boolean) => {
    updateIntegration.mutate({ id, data: { isConnected: !isConnected } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetIntegrationsQueryKey() });
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-light text-foreground">Data Sources</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect systems to power the intelligence engine.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations?.map((integration) => (
          <Card key={integration.id} className="bg-[#16161A] border-border overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[#0a0a0b] border border-border flex items-center justify-center text-xl">
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{integration.category}</p>
                </div>
              </div>
              <Switch 
                checked={integration.isConnected} 
                onCheckedChange={() => handleToggle(integration.id, integration.isConnected)}
                disabled={updateIntegration.isPending}
              />
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <p className="text-sm text-muted-foreground mb-4 h-10 line-clamp-2">
                {integration.description}
              </p>
              <div className="flex items-center justify-between text-xs border-t border-border pt-3 mt-auto">
                <span className="text-muted-foreground">Status</span>
                <span className={integration.isConnected ? "text-emerald-500" : "text-muted-foreground"}>
                  {integration.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              {integration.isConnected && integration.lastSyncAt && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className="text-foreground">{format(new Date(integration.lastSyncAt), "MMM d, HH:mm")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}