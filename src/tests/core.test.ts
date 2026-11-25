import {describe,expect,it} from 'vitest'
import {demo} from '@/data/demo'
import {convertArea,filterProperties,money,regionalArea,shortPrice} from '@/features/properties/model'
import {emi,purchaseCost,rentCost} from '@/features/calculators/math'
import {listingSchema,validPhoto} from '@/features/property-listing/schema'
import {clearCompare,compare,save,store} from '@/app/store'
describe('Indian listing tools',()=>{
 it('formats lakh and crore values',()=>{expect(money(1234567)).toBe('₹12,34,567');expect(shortPrice(2500000)).toBe('₹25 L');expect(shortPrice(12500000)).toBe('₹1.25 Cr')})
 it('converts acre, square metres, gaj and explicit regional units',()=>{expect(convertArea(1,'acre','sq ft')).toBe(43560);expect(convertArea(9,'sq ft','gaj')).toBe(1);expect(convertArea(1076.391,'sq ft','sq m')).toBeCloseTo(100);expect(regionalArea(2,27225)).toBe(54450)})
 it('filters and sorts serialized URL criteria',()=>{const params=new URLSearchParams({q:'Indore',sort:'price'});const result=filterProperties(demo,new URLSearchParams(params.toString()),'Buy');expect(result.length).toBeGreaterThan(1);expect(result.every(item=>item.city==='Indore'&&item.mode==='Buy')).toBe(true);expect(result.map(item=>item.price)).toEqual(result.map(item=>item.price).sort((a,b)=>a-b));expect(demo.length).toBeGreaterThanOrEqual(40)})
 it('checks listing data, category purpose, and file size',()=>{expect(listingSchema.safeParse(demo[0]).success).toBe(true);expect(listingSchema.safeParse({...demo[0],price:0}).success).toBe(false);expect(listingSchema.safeParse({...demo[0],mode:'Commercial'}).success).toBe(false);expect(validPhoto(new File(['a'],'photo.webp',{type:'image/webp'}))).toBe(true);expect(validPhoto(new File(['a'],'photo.svg',{type:'image/svg+xml'}))).toBe(false)})
 it('caps comparison at four and persists guest favourites',()=>{store.dispatch(clearCompare());for(const id of ['A','B','C','D','E'])store.dispatch(compare(id));expect(store.getState().selection.compared).toEqual(['A','B','C','D']);store.dispatch(compare('A'));expect(store.getState().selection.compared).not.toContain('A');store.dispatch(save('demo-a'));expect(JSON.parse(localStorage.getItem('habitat-saved')!)).toContain('demo-a');store.dispatch(save('demo-a'));expect(store.getState().selection.saved).not.toContain('demo-a')})
})
describe('financial tools',()=>{
 it('calculates reducing-balance EMI and pays down to zero',()=>{const result=emi(5200000,8.5,20);expect(result.monthly).toBeCloseTo(45126.82,0);expect(result.schedule.at(-1)?.balance).toBe(0);expect(result.schedule.reduce((sum,row)=>sum+row.principal,0)).toBeCloseTo(5200000)})
 it('handles zero interest',()=>{expect(emi(120000,0,1).monthly).toBe(10000);expect(emi(120000,0,1).interest).toBe(0)})
 it('breaks down rental and configurable acquisition costs',()=>{expect(rentCost(80000,24000,2000,48000,10000,2000)).toEqual({monthly:26000,initial:86000,ratio:32.5,deposit:48000,fees:12000});expect(purchaseCost(1000000,[5,1],[12000])).toBe(1072000)})
})
