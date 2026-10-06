'use client';
import {useMemo,useState} from 'react';
import {Search,Save,Languages} from 'lucide-react';
import {Input} from '@/components/ui/input';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

type Locale='ar'|'en'|'fr';
type Dictionary=Record<string,string>;
const base={ar:ar as Dictionary,en:en as Dictionary,fr:fr as Dictionary};

export default function LanguageSettings(){
 const [query,setQuery]=useState('');
 const [values,setValues]=useState(()=>({ar:{...base.ar},en:{...base.en},fr:{...base.fr}}));
 const [busy,setBusy]=useState<Locale|null>(null);
 const [feedback,setFeedback]=useState('');
 const keys=useMemo(()=>Array.from(new Set([...Object.keys(values.ar),...Object.keys(values.en),...Object.keys(values.fr)])).filter(k=>!query||k.toLowerCase().includes(query.toLowerCase())||(['ar','en','fr'] as Locale[]).some(l=>values[l][k]?.toLowerCase().includes(query.toLowerCase()))).sort(),[query,values]);
 const missing=(locale:Locale)=>keys.filter(k=>!values[locale][k]?.trim()).length;
 function change(locale:Locale,key:string,value:string){setValues(v=>({...v,[locale]:{...v[locale],[key]:value}}))}
 async function save(locale:Locale){setBusy(locale);setFeedback('');try{const r=await fetch('/api/control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save_translations',locale,dictionary:values[locale]})});if(!r.ok)throw new Error();setFeedback(locale==='ar'?'تم حفظ العربية.':'Saved.');window.dispatchEvent(new CustomEvent('foon-translations-updated'));}catch{setFeedback('تعذر حفظ الترجمات.')}finally{setBusy(null)}}
 return <section><div className="section-heading"><div><h2>إعدادات اللغات</h2><p>العربية هي اللغة الأساسية. كل مفتاح يظهر مقابل العربية والإنجليزية والفرنسية، وأي قيمة فارغة تُحسب كمفقودة.</p></div></div>
 <div className="form-card"><label><Search size={16}/> بحث في المفتاح أو النص<Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="dashboard / لوحة التحكم"/></label><div className="review-actions">{(['ar','en','fr'] as Locale[]).map(l=><button key={l} className="quiet-button" disabled={busy!==null} onClick={()=>save(l)}><Save size={16}/>{busy===l?'جارٍ الحفظ…':`حفظ ${l.toUpperCase()}`} · ناقص {missing(l)}</button>)}</div><p role="status">{feedback}</p></div>
 <div className="records-card language-editor"><div className="language-grid language-grid-head"><strong><Languages size={16}/> KEY</strong><strong>العربية · AR</strong><strong>English · EN</strong><strong>Français · FR</strong></div>{keys.map(key=><div className="language-grid" key={key}><code dir="ltr">{key}</code><Input dir="rtl" value={values.ar[key]??''} onChange={e=>change('ar',key,e.target.value)}/><Input dir="ltr" value={values.en[key]??''} onChange={e=>change('en',key,e.target.value)}/><Input dir="ltr" value={values.fr[key]??''} onChange={e=>change('fr',key,e.target.value)}/></div>)}</div>
 </section>
}
