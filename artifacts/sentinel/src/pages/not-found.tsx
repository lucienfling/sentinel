import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0b] text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-light text-primary tracking-tight">404</h1>
        <h2 className="text-2xl font-medium">Coordinate Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The intelligence sector you are trying to access does not exist or has been classified.
        </p>
        <div className="pt-6">
          <Link href="/">
            <Button className="font-medium tracking-wide">Return to Base</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}