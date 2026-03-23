import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Pizza, ShoppingBag, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const navLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/menu', icon: Pizza, label: 'Menu Management' },
  ]

  return (
    <div className="flex min-h-screen w-full bg-background flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-12 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
            <div className="flex h-14 items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
                <span className="text-2xl">🍕</span> PizzaExpert
              </Link>
            </div>
            <nav className="grid gap-1 px-4 py-6 font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted font-semibold"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t p-6 space-y-4 bg-muted/30">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Theme</span>
                  <ThemeSwitcher />
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground truncate">{user.email}</p>
                  <form action="/auth/signout" method="post" className="w-full">
                    <Button variant="outline" className="w-full justify-start gap-3 rounded-lg h-10 border-none bg-background hover:text-destructive" type="submit">
                      <LogOut className="h-4 w-4" /> Sign out
                    </Button>
                  </form>
               </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex items-center justify-center font-bold tracking-tight">
           <span className="text-primary pr-1">🍕</span> Admin
        </div>
        <ThemeSwitcher />
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-card lg:flex transition-transform duration-300">
        <div className="flex h-12 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tighter hover:opacity-80 transition-opacity">
            <span className="text-3xl filter drop-shadow-sm">🍕</span>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">PizzaExpert</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-bold space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground/80 transition-all hover:text-primary hover:bg-primary/5 group"
              >
                <link.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 flex flex-col gap-4 bg-muted/10 border-t">
          <div className="flex items-center justify-between px-2">
             <div className="space-y-0.5 max-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Logged in as</p>
                <p className="text-xs font-bold truncate text-foreground" title={user.email}>{user.email}</p>
             </div>
             <ThemeSwitcher />
          </div>
          <form action="/auth/signout" method="post" className="w-full">
            <Button variant="outline" className="w-full justify-start gap-3 rounded-lg font-bold h-10 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all" type="submit">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex flex-1 flex-col lg:pl-64 min-h-screen bg-background/50">
        <div className="flex-1 p-4 md:p-6 animate-in fade-in duration-500">
           {children}
        </div>
      </main>
    </div>
  )
}
