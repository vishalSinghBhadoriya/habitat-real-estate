import {types,modes,type Property} from '@/features/properties/model'
import {publicAsset} from '@/lib/paths'
export const art={hero:publicAsset('images/architecture/courtyard.webp'),apart:publicAsset('images/properties/apartment.webp'),villa:publicAsset('images/properties/villa.webp'),inside:publicAsset('images/interiors/living.webp'),office:publicAsset('images/properties/office.webp')}
const geography=[
 ['Indore',22.7196,75.8577,'Vijay Nagar','Nipania','Rau','Super Corridor','AB Road','Palasia','Bengali Square','Kanadia Road','MR-10','Sudama Nagar','Rajendra Nagar','Bicholi Mardana'],
 ['Bhopal',23.2599,77.4126,'Arera Colony','Kolar Road','Bawadia Kalan'],
 ['Mumbai',19.076,72.8777,'Powai','Bandra','Andheri'],['Pune',18.52,73.8567,'Baner','Wakad','Kharadi'],
 ['Delhi NCR',28.6139,77.209,'Dwarka','Greater Noida','Golf Course Road'],['Bengaluru',12.9716,77.5946,'Whitefield','Indiranagar','Yelahanka'],
 ['Hyderabad',17.385,78.4867,'Kondapur','Gachibowli','Kompally'],['Ahmedabad',23.0225,72.5714,'Bopal','Satellite','Thaltej'],
 ['Jaipur',26.9124,75.7873,'Vaishali Nagar','Malviya Nagar','Jagatpura'],['Lucknow',26.8467,80.9462,'Gomti Nagar','Aliganj','Indira Nagar'],
 ['Surat',21.1702,72.8311,'Vesu','Adajan','Pal'],['Chandigarh',30.7333,76.7794,'Sector 22','Sector 33','Sector 44'],
 ['Chennai',13.0827,80.2707,'Adyar','Velachery','Porur'],['Kolkata',22.5726,88.3639,'New Town','Salt Lake','Tollygunge']
] satisfies [string,number,number,...string[]][]
export const cities=geography.map(([name,lat,lng])=>({name,lat,lng}))
const concepts=['The Terraces','Kesar Courtyard','Fieldstone','House of Light','Garden Commons','The Grove','The Brickworks','Market Court','Logistics Yard','Juniper House','Campus Court']
export const demo:Property[]=geography.flatMap(([city,lat,lng,...localities],cityIndex)=>localities.map((locality,index)=>{
 const kind=(index+cityIndex*3)%types.length
 const category=types[kind]
 const mode=modes[kind===4||kind===5?2:kind>=6&&kind<=8?3:kind>=9?4:(index===3||cityIndex%4===1)&&kind<4?1:0]
 const title=concepts[kind]+' · '+locality
 const image=kind===0?art.apart:kind<4?art.villa:kind<6?publicAsset('images/properties/plot.svg'):kind<9?art.office:art.inside
 return {id:'demo-'+cityIndex+'-'+index,slug:(city+'-'+locality).toLowerCase().replace(/[^a-z0-9]+/g,'-'),title,city,locality,category,mode,price:mode==='PG'?6500+cityIndex*500:mode==='Rent'?18000+index*2500:3400000+kind*790000+cityIndex*265000,area:kind>=9?220:kind===0?1080:1210+kind*210,bhk:kind<=3?2+(kind%3):0,furnishing:kind>=4&&kind<9?'Unfurnished':index%2?'Furnished':'Semi-furnished',facing:['North','East','South','West'][index%4],description:'This fictional '+category.toLowerCase()+' listing illustrates typical search and comparison information for '+locality+'. Its photography and location are illustrative.',images:[image],lat:lat+Math.sin(index+1)*.018,lng:lng+Math.cos(index+1)*.018,demo:true}
}))
