export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h2 className="text-2xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-muted-foreground mb-4">Could not find the requested resource.</p>
      <a href="/" className="text-primary hover:underline">
        Return Home
      </a>
    </div>
  );
}
