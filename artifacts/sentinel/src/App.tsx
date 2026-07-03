import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import Home from '@/pages/home';
import Dashboard from '@/pages/dashboard';
import Analytics from '@/pages/analytics';
import Chat from '@/pages/chat';
import Integrations from '@/pages/integrations';
import Settings from '@/pages/settings';
import Subscribe from '@/pages/subscribe';
import NotFound from '@/pages/not-found';
import { Layout } from '@/components/layout';

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(217 91% 60%)",
    colorForeground: "hsl(240 5% 96%)",
    colorMutedForeground: "hsl(240 5% 65%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(240 9% 10%)",
    colorInput: "hsl(240 7% 18%)",
    colorInputForeground: "hsl(240 5% 96%)",
    colorNeutral: "hsl(240 7% 18%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#16161A] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#2A2A30] shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#f4f4f5] font-light text-2xl tracking-tight",
    headerSubtitle: "text-[#a1a1aa] font-light",
    socialButtonsBlockButtonText: "text-[#f4f4f5] font-normal",
    formFieldLabel: "text-[#a1a1aa] font-medium text-xs uppercase tracking-wider",
    footerActionLink: "text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors",
    footerActionText: "text-[#a1a1aa]",
    dividerText: "text-[#a1a1aa] font-medium text-xs",
    identityPreviewEditButton: "text-[#3b82f6] hover:text-[#60a5fa]",
    formFieldSuccessText: "text-[#10b981]",
    alertText: "text-[#ef4444]",
    logoBox: "mb-6 flex justify-center",
    logoImage: "w-12 h-12",
    socialButtonsBlockButton: "border-[#2A2A30] hover:bg-[#2A2A30] transition-colors",
    formButtonPrimary: "bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-sm transition-colors",
    formFieldInput: "bg-[#0a0a0b] border-[#2A2A30] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all text-[#f4f4f5] rounded-md",
    footerAction: "bg-[#0a0a0b] border-t border-[#2A2A30] p-6 flex justify-center w-full",
    dividerLine: "bg-[#2A2A30]",
    alert: "border border-[#ef4444] bg-[#ef4444]/10",
    otpCodeFieldInput: "border-[#2A2A30] text-[#f4f4f5]",
    formFieldRow: "mb-4",
    main: "px-8 py-8",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0b] px-4 bg-noise">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0b] px-4 bg-noise">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component, ...rest }: any) {
  return (
    <Route {...rest}>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </Route>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Executive Access",
            subtitle: "Enter your credentials to continue",
          },
        },
        signUp: {
          start: {
            title: "Request Access",
            subtitle: "Provision your Sentinel instance",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/analytics" component={Analytics} />
            <ProtectedRoute path="/chat" component={Chat} />
            <ProtectedRoute path="/integrations" component={Integrations} />
            <ProtectedRoute path="/settings" component={Settings} />
            <ProtectedRoute path="/subscribe" component={Subscribe} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;