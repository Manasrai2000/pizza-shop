'use client'

import { useState } from 'react'
import { useForm, useFieldArray, SubmitHandler, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { upsertMenuItem } from '@/lib/actions/menu'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  category_id: z.string().min(1, 'Category is required'),
  is_veg: z.boolean().default(true),
  is_bestseller: z.boolean().default(false),
  is_combo: z.boolean().default(false),
  prep_time: z.coerce.number().optional(),
  spiciness_level: z.coerce.number().min(0).max(3).default(0),
  menu_variants: z.array(z.object({
    id: z.string().optional(),
    variant_name: z.string().min(1, 'Variant name required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
  })).min(1, 'At least one variant is required')
})

type MenuItemFormValues = z.infer<typeof menuItemSchema>

interface MenuItemFormProps {
  item?: any
  categories: any[]
  onSuccess: (item: any) => void
  onCancel: () => void
}

export function MenuItemForm({ item, categories, onSuccess, onCancel }: MenuItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: item ? {
      ...item,
      menu_variants: item.menu_variants?.length > 0 ? item.menu_variants : [{ variant_name: 'Regular', price: 0 }]
    } : {
      name: '',
      description: '',
      image_url: '',
      category_id: '',
      is_veg: true,
      is_bestseller: false,
      is_combo: false,
      prep_time: 15,
      spiciness_level: 0,
      menu_variants: [{ variant_name: 'Regular', price: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'menu_variants'
  })

  const onSubmit: SubmitHandler<MenuItemFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      const result = await upsertMenuItem(data)
      if (result.success) {
        toast.success(item ? 'Item updated' : 'Item created')
        onSuccess({ ...data, id: result.id })
      }
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Margherita Pizza" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            onValueChange={(value) => setValue('category_id', value)} 
            defaultValue={watch('category_id')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="Detailed description of the dish..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" {...register('image_url')} placeholder="https://unsplash.com/..." />
        {errors.image_url && <p className="text-xs text-destructive">{errors.image_url.message}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2 border p-2 rounded-lg">
          <Switch 
            id="is_veg" 
            checked={watch('is_veg')} 
            onCheckedChange={(checked) => setValue('is_veg', checked)} 
          />
          <Label htmlFor="is_veg" className="text-[10px] font-bold uppercase">Veg</Label>
        </div>

        <div className="flex items-center space-x-2 border p-2 rounded-lg">
          <Switch 
            id="is_bestseller" 
            checked={watch('is_bestseller')} 
            onCheckedChange={(checked) => setValue('is_bestseller', checked)} 
          />
          <Label htmlFor="is_bestseller" className="text-[10px] font-bold uppercase">Best</Label>
        </div>

        <div className="flex items-center space-x-2 border p-2 rounded-lg">
          <Switch 
            id="is_combo" 
            checked={watch('is_combo')} 
            onCheckedChange={(checked) => setValue('is_combo', checked)} 
          />
          <Label htmlFor="is_combo" className="text-[10px] font-bold uppercase">Combo</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prep_time" className="text-[10px] uppercase font-bold">Prep Time (Min)</Label>
          <Input id="prep_time" type="number" {...register('prep_time')} className="h-8" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold">Price Variants</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ variant_name: '', price: 0 })}>
            <Plus className="h-3 w-3 mr-1" /> Add Variant
          </Button>
        </div>
        
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-end group">
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] text-muted-foreground">Name (e.g. Regular)</Label>
              <Input {...register(`menu_variants.${index}.variant_name` as const)} placeholder="Regular" className="h-9" />
            </div>
            <div className="w-24 space-y-1">
              <Label className="text-[10px] text-muted-foreground">Price (₹)</Label>
              <Input type="number" step="0.01" {...register(`menu_variants.${index}.price` as const)} className="h-9" />
            </div>
            {fields.length > 1 && (
              <Button type="button" variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {errors.menu_variants && <p className="text-xs text-destructive">{errors.menu_variants.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {item ? 'Save Changes' : 'Create Item'}
        </Button>
      </div>
    </form>
  )
}
