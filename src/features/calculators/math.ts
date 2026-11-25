export function emi(principal:number,annualRate:number,years:number){
 const months=Math.max(1,Math.round(years*12))
 const r=annualRate/1200
 const monthly=r===0?principal/months:principal*r/-Math.expm1(-months*Math.log1p(r))
 const total=monthly*months
 let balance=principal
 const schedule=Array.from({length:months},(_,index)=>{
  const interest=balance*r
  const paid=index===months-1?balance:Math.min(balance,monthly-interest)
  balance=Math.max(0,balance-paid)
  return {month:index+1,principal:paid,interest,balance}
 })
 return {monthly,total,interest:total-principal,schedule}
}
export function rentCost(income:number,rent:number,maintenance:number,deposit:number,brokerage:number,other:number){
 const monthly=rent+maintenance
 return {monthly,initial:monthly+deposit+brokerage+other,ratio:income>0?monthly/income*100:null,deposit,fees:brokerage+other}
}
export function purchaseCost(price:number,rates:number[],fees:number[]){return price+rates.reduce((sum,rate)=>sum+price*rate/100,0)+fees.reduce((sum,fee)=>sum+fee,0)}
