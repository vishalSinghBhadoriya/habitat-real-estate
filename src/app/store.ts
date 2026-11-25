import {configureStore,createSlice,type PayloadAction} from '@reduxjs/toolkit'
function read(key:string):string[]{try{const stored:unknown=JSON.parse(localStorage.getItem(key)??'[]');return Array.isArray(stored)?stored.filter((item):item is string=>typeof item==='string'):[]}catch{return []}}
function toggle(ids:string[],id:string,limit=Infinity){return ids.includes(id)?ids.filter(item=>item!==id):ids.length<limit?[...ids,id]:ids}
const selection=createSlice({name:'selection',initialState:{saved:read('habitat-saved'),compared:read('habitat-compare').slice(0,4)},reducers:{
 save(state,action:PayloadAction<string>){state.saved=toggle(state.saved,action.payload)},
 compare(state,action:PayloadAction<string>){state.compared=toggle(state.compared,action.payload,4)},
 clearCompare(state){state.compared=[]}
}})
export const {save,compare,clearCompare}=selection.actions
export const store=configureStore({reducer:{selection:selection.reducer}})
store.subscribe(()=>{const {saved,compared}=store.getState().selection;try{localStorage.setItem('habitat-saved',JSON.stringify(saved));localStorage.setItem('habitat-compare',JSON.stringify(compared))}catch{/* storage can be blocked */}})
export type State=ReturnType<typeof store.getState>
