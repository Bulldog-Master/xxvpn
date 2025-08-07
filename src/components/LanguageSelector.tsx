import { useState } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import languagesData from '@/data/languages.json';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languagesData.languages.find(lang => lang.code === i18n.language) || languagesData.languages[0]
  );

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language.code);
    console.log('Language changed to:', language.code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="bg-card/50 hover:bg-card/70 px-3 py-2 h-8">
          <Languages className="w-4 h-4 mr-2" />
          <span className="text-sm">{selectedLanguage.flag}</span>
          <span className="text-xs ml-1 hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-sm border-border">
        {languagesData.languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className="cursor-pointer flex items-center gap-3"
            onClick={() => handleLanguageChange(language)}
          >
            <span className="text-lg">{language.flag}</span>
            <div className="flex-1">
              <div className="text-sm font-medium">{language.name}</div>
              <div className="text-xs text-muted-foreground">{language.nativeName}</div>
            </div>
            {selectedLanguage.code === language.code && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;