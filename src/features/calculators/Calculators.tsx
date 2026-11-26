import {useState} from 'react'
import {Link,useLocation,useSearchParams} from 'react-router-dom'
import {money} from '@/features/properties/model'
import {emi,purchaseCost,rentCost} from './math'
const defaults=[6500000,1300000,8.5,20]
function Numbers({labels,values,onChange,max=[]}:{labels:string[];values:number[];onChange:(index:number,value:number)=>void;max?:number[]}){
 return <div className="fields">{labels.map((label,index)=><label key={label}>{label}<input type="number" min="0" max={max[index]} step="any" value={values[index]} onChange={event=>onChange(index,Math.max(0,Math.min(max[index]??Infinity,Number(event.target.value))))}/></label>)}</div>
}
export function EmiTool({compact=false,initialPrice=defaults[0]}:{compact?:boolean;initialPrice?:number}){
 const [values,setValues]=useState(()=>[initialPrice,Math.round(initialPrice*.2),defaults[2],defaults[3]])
 const [alternative,setAlternative]=useState(9)
 const [compare,setCompare]=useState(false)
 const [price,down,rate,years]=values
 const principal=Math.max(0,price-down)
 const result=emi(principal,rate,years)
 const principalShare=result.total?principal/result.total*100:100
 function change(index:number,value:number){setValues(previous=>{const next=previous.map((old,i)=>i===index?value:old);next[1]=Math.min(next[0],next[1]);return next})}
 return <><div className="tool-grid"><div className="tool-controls"><Numbers labels={['Property price (₹)','Down payment (₹)','Annual interest (%)','Tenure (years)']} values={values} onChange={change} max={[1e10,price,50,40]}/><label>Loan tenure <input type="range" min="1" max="40" value={years} onChange={event=>change(3,Number(event.target.value))}/></label>
 {!compact&&<><Numbers labels={['Down payment (%)','Loan amount (₹)']} values={[price?Math.round(down/price*10000)/100:0,principal]} onChange={(index,value)=>change(1,index===0?price*value/100:price-value)} max={[100,price]}/><button className="text-link" onClick={()=>{setValues(defaults);setAlternative(9);setCompare(false)}}>Reset values</button></>}</div>
 <div className="emi-result"><p className="eyebrow">Estimated monthly EMI</p><output className="tool-value">{money(result.monthly)}</output><div className="finance-bar" role="img" aria-label={Math.round(principalShare)+' percent principal'}><span style={{width:principalShare+'%'}}/></div><dl><div><dt>Principal</dt><dd>{money(principal)}</dd></div><div><dt>Interest</dt><dd>{money(result.interest)}</dd></div><div><dt>Total repayment</dt><dd>{money(result.total)}</dd></div></dl><small>Illustrative estimate. Loan terms and eligibility depend on the lender.</small></div></div>
 {!compact&&<><div className="comparison-input"><label className="check"><input type="checkbox" checked={compare} onChange={event=>setCompare(event.target.checked)}/> Compare another loan rate</label>{compare&&<><label>Alternative annual rate (%)<input type="number" min="0" max="50" step=".1" value={alternative} onChange={event=>setAlternative(Math.max(0,Math.min(50,Number(event.target.value))))}/></label><p>Alternative monthly EMI <strong>{money(emi(principal,alternative,years).monthly)}</strong></p></>}</div><details><summary>Yearly amortization schedule</summary><div className="table-scroll"><table><thead><tr><th>Year</th><th>Principal</th><th>Interest</th><th>Closing balance</th></tr></thead><tbody>{Array.from({length:Math.ceil(result.schedule.length/12)},(_,index)=>{const rows=result.schedule.slice(index*12,(index+1)*12);return <tr key={index}><th>{index+1}</th><td>{money(rows.reduce((sum,row)=>sum+row.principal,0))}</td><td>{money(rows.reduce((sum,row)=>sum+row.interest,0))}</td><td>{money(rows.at(-1)?.balance??0)}</td></tr>})}</tbody></table></div></details></>}</>
}
function readAmount(params:URLSearchParams,key:string,fallback:number){
 const raw=params.get(key)
 const value=Number(raw)
 return raw!==null&&Number.isFinite(value)&&value>=0&&value<=1e10?value:fallback
}
export default function Calculators(){
 const active=useLocation().pathname.split('/')[2]
 const [params]=useSearchParams()
 const price=readAmount(params,'price',defaults[0])
 const [rent,setRent]=useState(()=>[80000,readAmount(params,'rent',24000),2500,readAmount(params,'deposit',48000),12000,5000])
 const [purchase,setPurchase]=useState([6500000,0,0,0,0,15000,0])
 const result=rentCost(...rent as [number,number,number,number,number,number])
 return <section className="page-width section subpage"><p className="eyebrow accent">Financial planning</p><h1>Property <em>calculators.</em></h1><div className="segmented"><Link aria-current={!active||active==='emi'?'page':undefined} to="/calculators/emi">Home loan EMI</Link><Link aria-current={active==='rent'?'page':undefined} to="/calculators/rent">Rental affordability</Link><Link aria-current={active==='purchase-cost'?'page':undefined} to="/calculators/purchase-cost">Purchase cost</Link></div>
 {active==='rent'?<div className="tool-grid"><Numbers labels={['Monthly income (₹)','Monthly rent (₹)','Monthly maintenance (₹)','Refundable deposit (₹)','Brokerage (₹)','Other move-in expenses (₹)']} values={rent} onChange={(index,value)=>setRent(old=>old.map((n,i)=>i===index?value:n))}/><div className="emi-result"><p className="eyebrow">Estimated monthly housing cost</p><p className="tool-value">{money(result.monthly)}</p><dl><div><dt>Move-in total including first month</dt><dd>{money(result.initial)}</dd></div><div><dt>Housing cost / income</dt><dd>{result.ratio===null?'—':result.ratio.toFixed(1)+'%'}</dd></div><div><dt>Refundable deposit</dt><dd>{money(result.deposit)}</dd></div><div><dt>One-time fees</dt><dd>{money(result.fees)}</dd></div></dl><small>These figures depend on your inputs and lease terms.</small></div></div>:active==='purchase-cost'?<div className="tool-grid"><Numbers labels={['Purchase price (₹)','Stamp duty (%)','Registration (%)','Brokerage (%)','Applicable taxes (%)','Legal expenses (₹)','Renovation (₹)']} values={purchase} onChange={(index,value)=>setPurchase(old=>old.map((n,i)=>i===index?value:n))}/><div className="emi-result"><p className="eyebrow">Estimated acquisition cost</p><p className="tool-value">{money(purchaseCost(purchase[0],purchase.slice(1,5),purchase.slice(5)))}</p><p>Percentage charges are applied to the entered purchase price. Enter rates confirmed for your state, property and circumstances.</p></div></div>:<EmiTool key={price} initialPrice={price}/>}
 </section>
}
