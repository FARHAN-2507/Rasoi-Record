export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        {children}
      </div>
    )
  }
