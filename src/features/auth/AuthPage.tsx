import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {Link,useLocation,useNavigate,useSearchParams} from 'react-router-dom'
import {useState} from 'react'
import {absoluteAppUrl} from '@/lib/paths'
import {supabase} from '@/lib/supabase'
import {useSession} from './session'
export default function AuthPage(){
 const {pathname}=useLocation()
 const [params]=useSearchParams()
 const navigate=useNavigate()
 const {session,ready,recovering}=useSession()
 const [status,setStatus]=useState('')
 const recovery=pathname==='/forgot-password'
 const reset=pathname==='/reset-password'
 const register=pathname==='/register'
 const schema=z.object({email:reset?z.string().optional():z.string().email('Enter a valid email address'),password:recovery?z.string().optional():z.string().min(register||reset?8:1,register||reset?'Use at least eight characters':'Enter your password')})
 const form=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema)})
 const submit=form.handleSubmit(async values=>{
  if(!supabase||(reset&&!recovering))return
  setStatus('')
  const {error,data}=recovery?await supabase.auth.resetPasswordForEmail(values.email!,{redirectTo:absoluteAppUrl('/reset-password')}):reset?await supabase.auth.updateUser({password:values.password!}):register?await supabase.auth.signUp({email:values.email!,password:values.password!,options:{emailRedirectTo:absoluteAppUrl('/dashboard')}}):await supabase.auth.signInWithPassword({email:values.email!,password:values.password!})
  if(error){setStatus(error.code === 'invalid_credentials' ? 'Check your email and password and try again.' : error.code === 'email_not_confirmed' ? 'Confirm your email address before logging in.' : 'Your request could not be completed. Please try again.');return}
  if(recovery){setStatus('If the address is registered, check your inbox for a recovery link.');return}
  if(register&&!(data&&'session' in data&&data.session)){setStatus('Check your inbox to confirm your email address.');return}
  const next=params.get('next')??''
  void navigate(/^\/(?![\\/])/.test(next)?next:'/dashboard',{replace:true})
 })
 return <section className="page-width section subpage"><p className="eyebrow accent">Your HABITAT account</p><h1>{reset?'Choose a new password':recovery?'Recover your account':register?'Create an account':'Welcome back'}<em>.</em></h1>
 {!supabase?<p className="notice">Accounts are unavailable in this preview.</p>:reset&&!ready?<p>Checking your recovery link…</p>:reset&&(!session||!recovering)?<p>Open the password recovery link from your email.</p>:<form className="stack" onSubmit={submit} noValidate>{!reset&&<label>Email<input type="email" autoComplete="email" {...form.register('email')}/>{form.formState.errors.email&&<span className="error">{form.formState.errors.email.message}</span>}</label>}{!recovery&&<label>Password<input type="password" autoComplete={register||reset?'new-password':'current-password'} {...form.register('password')}/>{form.formState.errors.password&&<span className="error">{form.formState.errors.password.message}</span>}</label>}<button className="button" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting?'Please wait…':reset?'Update password':recovery?'Send recovery link':register?'Create account':'Log in'}</button><p role="status">{status}</p></form>}
 <div className="segmented"><Link to="/login">Log in</Link><Link to="/register">Create account</Link><Link to="/forgot-password">Forgot password</Link></div></section>
}
