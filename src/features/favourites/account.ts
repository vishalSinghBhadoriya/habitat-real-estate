import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {supabase} from '@/lib/supabase'
import {useSession} from '@/features/auth/session'
export function useAccountFavourites(){
 const {session}=useSession()
 const id=session?.user.id
 const queryKey=['account-favourites',id]
 const client=useQueryClient()
 const query=useQuery({queryKey,enabled:!!(supabase&&id),queryFn:async()=>{
  const {data,error}=await supabase!.from('saved_properties').select('property_id').eq('user_id',id!).order('created_at',{ascending:false})
  if(error)throw error
  return data.map(row=>row.property_id as string)
 }})
 const mutation=useMutation({mutationFn:async ({propertyId,remove}:{propertyId:string;remove:boolean})=>{
  const operation=remove?supabase!.from('saved_properties').delete().eq('user_id',id!).eq('property_id',propertyId):supabase!.from('saved_properties').insert({user_id:id,property_id:propertyId})
  const {error}=await operation
  if(error)throw error
 },onSettled:()=>client.invalidateQueries({queryKey})})
 return {isAccount:!!id,query,mutation}
}
