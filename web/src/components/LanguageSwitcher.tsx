'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState } from 'react'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' }
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const [open, setOpen] = useState(false) // Dropdown status

  const switchLanguage = (newLocale: string) => {
    // Remove the current locale prefix from the path
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
    // Navigate to the same path but with the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
    // Close the dropdown after selecting a language
    setOpen(false)
  }

  return (
      <div className="relative">
        {/* relative positioning allows dropdown to be positioned absolutely inside */}
      <button
        onClick={() => setOpen(!open)} // Toggles dropdown visibility when clicked
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
      >
         {/* Finds the language object matching the current locale and displays its label (English or Français) */}
        🌐 {languages.find(l => l.code === currentLocale)?.label} ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 
                ${lang.code === currentLocale ? 'font-semibold bg-gray-50' : ''}`} // Highlights currently active language
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
