import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const Navbar = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/40 border-x-0 border-t-0 rounded-none bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-1.5 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
              <img src="/logo.png" alt="AgriPulse Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
                {t('appName')}
              </Link>
              <p className="text-[0.65rem] uppercase tracking-widest text-primary-600 font-semibold">{t('navSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-slate-600 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-primary-50">
              {t('home')}
            </Link>
            <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-primary-50">
              {t('dashboard')}
            </Link>
            <Link to="/alerts" className="text-slate-600 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-primary-50">
              {t('alerts')}
            </Link>
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="ml-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-primary-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {t('changeLanguage')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
