import type { Metadata } from 'next';
import './globals.css';
import './premium.css';
import { PreferencesProvider } from '@/components/platform/preferences';
import { GlobalErrorMonitor } from '@/components/platform/global-error-monitor';
export const metadata: Metadata={title:'FOON | منصة المتاجر',description:'منصة متعددة الأنشطة تجمع المتاجر والمطاعم والخدمات.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl" suppressHydrationWarning><body><PreferencesProvider>{children}<GlobalErrorMonitor/></PreferencesProvider></body></html>}
