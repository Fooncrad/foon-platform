'use client';
import {usePreferences} from './preferences';
import Link from 'next/link';
export default function AccessDenied(){const {t}=usePreferences();return <section className="page-heading"><h1>{t.notAllowed}</h1><Link className="primary-button" href="/store">{t.storeWorkspace}</Link></section>}
