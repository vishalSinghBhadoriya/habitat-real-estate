import {useSyncExternalStore} from 'react'
import type {Session} from '@supabase/supabase-js'
import {supabase} from '@/lib/supabase'
let snapshot:{session:Session|null;ready:boolean;recovering:boolean}={session:null,ready:!supabase,recovering:false}
const listeners=new Set<()=>void>()
supabase?.auth.onAuthStateChange((event,session)=>{
 const recovering=event==='PASSWORD_RECOVERY'||(snapshot.recovering&&!!session&&!['USER_UPDATED','SIGNED_OUT'].includes(event))
 snapshot={session,ready:true,recovering}
 listeners.forEach(callback=>callback())
})
function subscribe(callback:()=>void){listeners.add(callback);return ()=>{listeners.delete(callback)}}
const getSnapshot=()=>snapshot
export function useSession(){return useSyncExternalStore(subscribe,getSnapshot)}
