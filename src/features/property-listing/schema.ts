import {z} from 'zod'
import {modes,types} from '@/features/properties/model'
export const listingSchema=z.object({
 title:z.string().trim().min(5).max(100),city:z.string().trim().min(2).max(80),locality:z.string().trim().min(2).max(80),
 category:z.enum(types),mode:z.enum(modes),price:z.coerce.number().positive().max(1e10),area:z.coerce.number().positive().max(1e8),
 bhk:z.coerce.number().int().min(0).max(20),furnishing:z.enum(['Furnished','Semi-furnished','Unfurnished']),facing:z.enum(['North','East','South','West','Unspecified']),
 description:z.string().trim().min(20).max(4000)
}).refine(x=>x.mode===(x.category.endsWith('plot')?'Plots':['Office','Shop','Warehouse'].includes(x.category)?'Commercial':['PG','Hostel'].includes(x.category)?'PG':x.mode==='Rent'?'Rent':'Buy'),{path:['mode'],message:'Choose a purpose that matches the property type.'})
export type Listing=z.infer<typeof listingSchema>
export const mime=['image/jpeg','image/png','image/webp','image/avif']
export const validPhoto=(file:File)=>file.size>0&&file.size<=8*1024*1024&&mime.includes(file.type)
