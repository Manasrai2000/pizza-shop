'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (view === 'sign-up') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        toast.info("Check your email", {
          description: "We sent you a confirmation link.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/admin')
        router.refresh()
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "An expected error occurred."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
           <div className="flex justify-center mb-4">
             <span className="text-4xl">🍕</span>
           </div>
           <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
           <CardDescription>
             {view === 'sign-in' 
               ? "Sign in to your admin account" 
               : "Create a new admin account"
             }
           </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {view === 'sign-in' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => setView(view === 'sign-in' ? 'sign-up' : 'sign-in')}
            >
              {view === 'sign-in'
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
