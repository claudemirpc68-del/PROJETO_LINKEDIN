import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      
      {/* Main content */}
      <main className="md:pl-64 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
