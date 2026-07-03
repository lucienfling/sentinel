import { useGetSubscription, useUpgradeSubscription } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSubscriptionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Subscribe() {
  const { data: subscription } = useGetSubscription();
  const upgradeSubscription = useUpgradeSubscription();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUpgrade = (plan: "pro" | "enterprise") => {
    upgradeSubscription.mutate({ data: { plan } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey() });
        toast({ title: "System Upgraded", description: `Sentinel initialized at ${plan.toUpperCase()} tier.` });
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-light text-foreground mb-4">Quality Always Comes With a Cost</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl font-light">
          Sentinel is premium intelligence infrastructure for professionals whose time is their most valuable asset. No tracking, no ads, absolute privacy.
        </p>
      </header>

      {subscription && (
        <div className="flex justify-center mb-12">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/10 text-primary uppercase tracking-widest">
            Current Status: {subscription.plan} ({subscription.status})
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className={cn(
          "bg-[#16161A] border-border flex flex-col relative overflow-hidden transition-all",
          subscription?.plan === 'pro' && "border-primary/50 ring-1 ring-primary/20"
        )}>
          {subscription?.plan === 'pro' && (
            <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground rounded-bl-lg">
              ACTIVE
            </div>
          )}
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light">Pro</CardTitle>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-semibold">$29</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <CardDescription className="pt-4">For independent executives and founders.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Daily Intelligence Briefings</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Full Data Integrations</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Advanced Analytics</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Basic AI Analyst Access</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={subscription?.plan === 'pro' ? "outline" : "default"}
              onClick={() => handleUpgrade("pro")}
              disabled={subscription?.plan === 'pro' || upgradeSubscription.isPending}
            >
              {subscription?.plan === 'pro' ? "Current Plan" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={cn(
          "bg-gradient-to-b from-[#1c1c21] to-[#0a0a0b] border-border flex flex-col relative overflow-hidden transition-all",
          subscription?.plan === 'enterprise' && "border-primary/50 ring-1 ring-primary/20"
        )}>
          {subscription?.plan === 'enterprise' && (
            <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground rounded-bl-lg">
              ACTIVE
            </div>
          )}
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light">Enterprise</CardTitle>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-semibold">$99</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <CardDescription className="pt-4">For high-leverage teams and operators.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Everything in Pro</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Infinite AI Analyst Context</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Team Repository Sync</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Priority API Processing</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-white text-black hover:bg-white/90" 
              onClick={() => handleUpgrade("enterprise")}
              disabled={subscription?.plan === 'enterprise' || upgradeSubscription.isPending}
            >
              {subscription?.plan === 'enterprise' ? "Current Plan" : "Upgrade to Enterprise"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}