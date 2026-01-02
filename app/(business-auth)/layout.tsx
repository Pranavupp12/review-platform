// app/(business-auth)/layout.tsx
export default function BusinessAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* No Header, No Footer - Just the page content */}
      {children}
    </div>
  );
}