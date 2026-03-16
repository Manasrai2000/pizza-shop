import { createClient } from '@/lib/supabase/server'
import { MenuItemCard } from '@/components/menu/menu-item-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Clock } from 'lucide-react'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories, error: catsError } = await fallbackFetchCategories(supabase)
  // Fetch menu items with variants
  const { data: menuItems, error: itemsError } = await fallbackFetchMenuItems(supabase)

  const isError = catsError || itemsError

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 z-10">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
              Now delivering to your area!
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              Delicious Food, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                Delivered Fast
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-[600px] leading-relaxed">
              Craving pizza, burgers, or tacos? Get the best local food delivered straight to your door in under 30 minutes. Hot, fresh, and ready to eat.
            </p>
            
            <div className="flex items-center gap-8 pt-6 border-t border-border/50">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold flex items-center gap-1">4.9 <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /></span>
                <span className="text-sm text-muted-foreground">10k+ Reviews</span>
              </div>
              <div className="w-px h-12 bg-border/50" />
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold">30m</span>
                <span className="text-sm text-muted-foreground">Avg Delivery</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative w-full aspect-square max-w-lg mx-auto md:max-w-none md:aspect-auto md:h-[500px] z-10">
             <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full blur-3xl opacity-20 animate-pulse" />
             <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border bg-card flex flex-col items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2681&auto=format&fit=crop')] bg-cover bg-center before:absolute before:inset-0 before:bg-black/40">
                <div className="relative z-20 text-center text-white space-y-4">
                 <span className="text-6xl">🍕</span>
                 <h2 className="text-3xl font-bold">Hot & Fresh</h2>
                 <p className="text-white/80">Baked specially for you</p>
                </div>
             </div>
             
             <div className="absolute -bottom-6 -left-6 bg-background rounded-2xl p-4 shadow-xl border flex items-center gap-4 animate-bounce">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="text-green-600 h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Fast Delivery</div>
                  <div className="font-bold">Under 30 Mins</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Full Menu Section */}
      <section className="container mx-auto px-4 py-16" id="menu">
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Our Menu</h2>
          <p className="text-lg text-muted-foreground">
            Choose your favorites from our rich, freshly made categories below. Add to cart to see them instantly show up above!
          </p>
        </div>

        {isError && (
          <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-destructive mb-2">Failed to load menu</h3>
            <p className="text-muted-foreground">Please check your database connection or schema.</p>
          </div>
        )}

        {!isError && (!categories || categories.length === 0) ? (
          <div className="text-center py-20 space-y-4">
            <h3 className="text-2xl font-bold">Menu is empty</h3>
            <p className="text-muted-foreground">No categories or items found. Waiting for database to be populated...</p>
          </div>
        ) : !isError && categories ? (
           <Tabs defaultValue={categories[0]?.id.toLowerCase()} className="w-full">
            <div className="flex justify-center mb-8 border-b overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent h-14 w-full justify-start md:justify-center p-0 space-x-6 min-w-max">
                {categories.map((category: any) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id.toLowerCase()}
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 text-lg font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((category: any) => {
              const catItems = menuItems?.filter((item: any) => item.category_id === category.id) || []
              
              return (
                <TabsContent key={category.id} value={category.id.toLowerCase()} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {catItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {catItems.map((item: any) => (
                        <MenuItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                      <p className="text-muted-foreground">No items currently available in the {category.name} category.</p>
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        ) : null}
      </section>
    </div>
  )
}

async function fallbackFetchCategories(supabase: any) {
  try {
    return await supabase.from('categories').select('*').order('name')
  } catch (e) {
    return { data: null, error: e }
  }
}

async function fallbackFetchMenuItems(supabase: any) {
  try {
    return await supabase.from('menu_items').select('*, menu_variants (*)').order('name')
  } catch (e) {
    return { data: null, error: e }
  }
}
