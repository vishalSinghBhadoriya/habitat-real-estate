import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

const url=process.env.HABITAT_TEST_URL??'http://127.0.0.1:5173'
const browser=await chromium.launch({channel:'msedge'})
const shots=join(tmpdir(),'habitat-preview')
await mkdir(shots,{recursive:true})
try {
 for(const viewport of [{width:1440,height:900},{width:768,height:1024},{width:390,height:844}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'})
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000})
  await page.getByRole('heading',{name:/Every dream/}).waitFor()
  await page.locator('.hero-img').evaluate(img=>img.decode())
  await page.screenshot({path:join(shots,'home-'+viewport.width+'.png')})
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow')
  await page.getByRole('button',{name:'Get outside'}).click()
  await page.getByRole('img',{name:/balcony highlighted/}).waitFor()
  await page.getByRole('link',{name:'Browse east-facing homes'}).click()
  await page.waitForURL(target=>target.pathname==='/buy'&&target.searchParams.get('facing')==='East')
  await page.goto(url,{waitUntil:'domcontentloaded'})
  if(viewport.width<900){
   await page.getByRole('button',{name:'Open menu'}).click()
   await page.getByRole('navigation',{name:'Site menu'}).waitFor()
   await page.keyboard.press('Escape')
   await page.getByRole('navigation',{name:'Site menu'}).waitFor({state:'hidden'})
  }
  await page.locator('.search-box input').fill('Indore')
  await page.getByRole('button',{name:'Search properties'}).click()
  await page.waitForURL('**/buy?q=Indore')
  await page.locator('.property-card').first().waitFor()
  await page.getByRole('button',{name:'Save property'}).first().click()
  await page.getByRole('button',{name:'Compare property'}).first().click()
  await page.locator('.property-title').first().click()
  await page.getByRole('heading',{name:'Property overview.'}).waitFor()
  await page.getByRole('button',{name:'Open gallery fullscreen'}).click()
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.goto(url+'/compare',{waitUntil:'domcontentloaded'})
  await page.getByRole('table').waitFor()
  await page.goto(url+'/saved',{waitUntil:'domcontentloaded'})
  await page.locator('.property-card').first().waitFor()
  await page.goto(url+'/plot-studio',{waitUntil:'domcontentloaded'})
  await page.getByRole('button',{name:'40 × 60'}).click()
  await page.getByText('2,400',{exact:false}).first().waitFor()
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Plot Studio overflow')
  await page.goto(url+'/calculators/emi',{waitUntil:'domcontentloaded'})
  await page.getByText('Estimated monthly EMI').waitFor()
  await page.goto(url+'/dashboard/listings',{waitUntil:'domcontentloaded'})
  await page.waitForURL(target=>target.pathname==='/login'&&target.searchParams.get('next')==='/dashboard/listings')
  if(viewport.width===1440){
   await page.goto(url+'/list-property',{waitUntil:'domcontentloaded'})
   await page.getByLabel('Title',{exact:true}).fill('Rau Garden Apartment')
   await page.getByLabel('City',{exact:true}).fill('Indore')
   await page.getByLabel('Locality',{exact:true}).fill('Rau')
   await page.getByLabel('Description').fill('A two-bedroom demonstration apartment with a courtyard.');
   await page.getByRole('button',{name:'Continue'}).click()
   await page.getByLabel('Area (sq ft)').fill('1100')
   await page.getByRole('button',{name:'Continue'}).click()
   await page.getByRole('heading',{name:'Photographs'}).waitFor()
   await page.getByRole('button',{name:'Continue'}).click()
   await page.getByLabel('Asking price (₹)').fill('6500000')
   await page.getByRole('button',{name:'Continue'}).click()
   await page.getByRole('heading',{name:'Rau Garden Apartment'}).waitFor()
   await page.getByRole('button',{name:'Switch language'}).click()
   assert.equal(await page.locator('html').getAttribute('lang'),'hi')
  }
  assert.deepEqual(pageErrors,[])
  console.log(JSON.stringify({viewport:viewport.width,passed:true}))
  await page.close()
 }
 const page=await browser.newPage({viewport:{width:1440,height:900}})
 await page.addInitScript(()=>{new PerformanceObserver(list=>{sessionStorage.setItem('qa-lcp',String(list.getEntries().at(-1)?.startTime))}).observe({type:'largest-contentful-paint',buffered:true})})
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000})
 await page.getByRole('heading',{name:/Every dream/}).waitFor()
 await page.locator('.hero-img').evaluate(img=>img.decode())
 await page.evaluate(()=>document.fonts.ready)
 await page.waitForFunction(()=>Number(sessionStorage.getItem('qa-lcp'))>0,{},{timeout:10000})
 const timings=await page.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0];return {domContentLoadedMs:Math.round(nav.domContentLoadedEventEnd),loadMs:Math.round(nav.loadEventEnd),lcpMs:Math.round(Number(sessionStorage.getItem('qa-lcp')))}})
 console.log(JSON.stringify({timings,screenshots:shots}))
} finally {await browser.close()}
