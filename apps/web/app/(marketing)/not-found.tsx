import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-wide py-32 text-center">
      <div className="font-display text-9xl font-semibold gradient-text">404</div>
      <h1 className="mt-6 heading-xl">Page not found</h1>
      <p className="mt-4 body-lg max-w-md mx-auto">
        The page you’re looking for moved, was renamed or never existed. Let’s get you back home.
      </p>
      <div className="mt-8 inline-flex">
        <Button asChild variant="accent" size="lg">
          <Link href="/">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </Button>
      </div>
    </section>
  );
}
