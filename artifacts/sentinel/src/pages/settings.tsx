import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: profile } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    displayName: "",
    title: "",
    salutation: "",
    timezone: "",
    briefingTime: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        title: profile.title,
        salutation: profile.salutation,
        timezone: profile.timezone,
        briefingTime: profile.briefingTime
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        toast({ title: "Settings updated", description: "Your preferences have been saved." });
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-light text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your intelligence feed preferences.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-[#16161A] border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Executive Profile</CardTitle>
            <CardDescription>How the system identifies and addresses you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Name</label>
              <input 
                type="text" 
                value={formData.displayName} 
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Official Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Salutation</label>
              <input 
                type="text" 
                value={formData.salutation} 
                onChange={(e) => setFormData({...formData, salutation: e.target.value})}
                placeholder="e.g. Sir, Ma'am, First Name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#16161A] border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Briefing Delivery</CardTitle>
            <CardDescription>Timing and localization settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timezone</label>
              <input 
                type="text" 
                value={formData.timezone} 
                onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Briefing Time (HH:MM)</label>
              <input 
                type="time" 
                value={formData.briefingTime} 
                onChange={(e) => setFormData({...formData, briefingTime: e.target.value})}
                className="flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  );
}