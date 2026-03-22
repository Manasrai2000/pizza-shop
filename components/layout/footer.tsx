'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🍕</span> PizzaExpert
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Serving the best pizzas, burgers, and tacos in town.
              Hot, fresh, and lightning fast.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Menu</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#menu" className="hover:text-primary transition-colors">Pizza</Link></li>
              <li><Link href="/#menu" className="hover:text-primary transition-colors">Burgers</Link></li>
              <li><Link href="/#menu" className="hover:text-primary transition-colors">Sandwiches</Link></li>
              <li><Link href="/#menu" className="hover:text-primary transition-colors">Tacos</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Login</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Fast Food Street, NY 10001</li>
              <li>hello@pizzaexpert.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PizzaExpert. All rights reserved.</p>
          <p>Powered by Next.js & Supabase</p>
        </div>
      </div>
    </footer>
  )
}
