import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  MessageSquare, 
  LayoutTemplate, 
  BarChart3, 
  Layers, 
  Calendar,
  ImageIcon,
  Linkedin,
  Sparkles,
  Menu,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Templates', href: '/templates', icon: LayoutTemplate },
  { name: 'Analisar Post', href: '/analyze', icon: BarChart3 },
  { name: 'Carrossel', href: '/carousel', icon: Layers },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Galeria', href: '/gallery', icon: ImageIcon },
  { name: 'LinkedIn', href: '/linkedin', icon: Linkedin },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta.'
    });
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg linkedin-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">LinkedIn Viral</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
                  <div className="w-10 h-10 rounded-lg linkedin-gradient flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-foreground">LinkedIn Viral</h1>
                    <p className="text-xs text-muted-foreground">Post Generator</p>
                  </div>
                </div>

                <nav className="px-4 py-6 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      end={item.href === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>

                {/* Auth Section */}
                <div className="px-4 py-4 border-t border-border mt-auto">
                  {loading ? (
                    <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                  ) : user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setOpen(false);
                        setAuthModalOpen(true);
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      Entrar
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
