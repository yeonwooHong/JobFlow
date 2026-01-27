import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobFlow",
  description: "Job Tracking and Management System",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const params = await props.params;
  const locale = params.locale;
  
  // 지원하지 않는 언어로 접속 시 404 처리
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 서버에서 해당 언어의 번역 메시지를 가져옵니다.
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* To make it able to use useTranslations */}
        <NextIntlClientProvider messages={messages} locale={locale}> 
          {props.children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}