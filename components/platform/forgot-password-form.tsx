'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Mail,ArrowLeft,LockKeyhole} from 'lucide-react';
import {usePreferences} from './preferences';
const words={
 ar:{title:'استعادة كلمة المرور',subtitle:'أدخل بريد حسابك وسنرسل رابطًا آمنًا لإعادة التعيين.',email:'البريد الإلكتروني',send:'إرسال رابط الاستعادة',sent:'إذا كان البريد مرتبطًا بحساب، سنرسل إليه رابط استعادة كلمة المرور.',error:'تعذر إرسال الطلب. حاول مجددًا بعد قليل.',back:'العودة لتسجيل الدخول',loading:'جارٍ الإرسال…'},
 en:{title:'Reset your password',subtitle:'Enter your account email and we’ll send a secure reset link.',email:'Email',send:'Send reset link',sent:'If an account matches this email, we’ll send a password reset link.',error:'Could not submit the request. Please try again shortly.',back:'Back to sign in',loading:'Sending…'},
 fr:{title:'Réinitialiser le mot de passe',subtitle:'Saisissez l’adresse de votre compte pour recevoir un lien sécurisé.',email:'E-mail',send:'Envoyer le lien',sent:'Si un compte correspond à cette adresse, nous enverrons un lien de réinitialisation.',error:'Impossible d’envoyer la demande. Réessayez bientôt.',back:'Retour à la connexion',loading:'Envoi…'}
};
export default function ForgotPasswordForm(){const {locale}=usePreferences();const effectiveLocale=(locale==='en'||locale==='fr'||locale==='ar')?locale:'ar';const t=words[effectiveLocale];const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/auth/request-password-reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,locale:effectiveLocale})});if(!r.ok)throw Error();setSent(true)}catch{setError(t.error)}finally{setBusy(false)}}
 return <main className="legacy-login-main"><section className="legacy-login-card"><div className="legacy-login-title"><span><LockKeyhole/></span><div><h1>{t.title}</h1><p>{t.subtitle}</p></div></div>{sent?<p className="success-text" role="status">{t.sent}</p>:<form onSubmit={submit}><label>{t.email}<span className="legacy-login-input"><Mail/><input type="email" autoComplete="email" required maxLength={254} dir="ltr" value={email} onChange={e=>setEmail(e.target.value)}/></span></label>{error&&<p className="signup-error" role="alert">{error}</p>}<button className="primary-button legacy-login-submit" disabled={busy}>{busy?t.loading:t.send}</button></form>}<div className="legacy-login-register"><Link href="/login"><ArrowLeft size={16}/>{t.back}</Link></div></section></main>
}
