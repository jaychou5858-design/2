import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import ReviewModule from './components/ReviewModule';
import { DictionaryResult, SavedWord } from './types';
import { fetchDefinition, fetchWordImage } from './services/gemini';
import { BookIcon, CardIcon, SearchIcon, DownloadIcon } from './components/Icons';

type ViewMode = 'search' | 'review';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('search');
  
  // Search State
  const [data, setData] = useState<DictionaryResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Favorites State
  const [favorites, setFavorites] = useState<SavedWord[]>([]);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem('unilexicon_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    // Capture the PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const saveFavorites = (newFavorites: SavedWord[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('unilexicon_favorites', JSON.stringify(newFavorites));
  };

  const handleToggleFavorite = () => {
    if (!data) return;

    const exists = favorites.find(f => f.word.toLowerCase() === data.word.toLowerCase());
    
    if (exists) {
      const updated = favorites.filter(f => f.word.toLowerCase() !== data.word.toLowerCase());
      saveFavorites(updated);
    } else {
      const newSavedWord: SavedWord = {
        ...data,
        imageUrl: imageUrl, // Save the image URL with it if it exists
        savedAt: Date.now()
      };
      saveFavorites([newSavedWord, ...favorites]);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const isCurrentFavorite = data ? favorites.some(f => f.word.toLowerCase() === data.word.toLowerCase()) : false;

  const handleSearch = async (term: string) => {
    setView('search');
    setData(null);
    setImageUrl(null);
    setError(null);
    setLoadingText(true);
    setLoadingImage(true);

    try {
      // 1. Fetch Text
      const definition = await fetchDefinition(term);
      setData(definition);
      setLoadingText(false);

      // 2. Fetch Image
      try {
        const image = await fetchWordImage(term);
        setImageUrl(image);
      } catch (imgErr) {
        console.warn("Image fetch failed", imgErr);
      } finally {
        setLoadingImage(false);
      }

    } catch (err) {
      console.error(err);
      setError("We couldn't find that word. Please check the spelling or try another term.");
      setLoadingText(false);
      setLoadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView('search')}>
              <div className="p-2 bg-indigo-600 rounded-xl mr-3 shadow-sm">
                 <BookIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden xs:block">
                Uni<span className="text-indigo-600">Lexicon</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setView('search')}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'search' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <SearchIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={() => setView('review')}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'review' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <CardIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Review</span>
                {favorites.length > 0 && (
                  <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs py-0.5 px-2 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Install Button (Only visible if prompt is captured) */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="ml-2 flex items-center px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                  title="Install App"
                >
                  <DownloadIcon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">App</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'search' ? (
          <>
            <div className={`transition-all duration-500 ${data ? 'py-4' : 'py-20 lg:py-32 flex flex-col items-center'}`}>
              {!data && !loadingText && (
                <div className="text-center mb-8 max-w-lg px-4">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Master Academic English</h2>
                  <p className="text-slate-500 text-lg">
                    AI-powered definitions, visuals, and smart examples for students.
                  </p>
                </div>
              )}
              
              <SearchBar onSearch={handleSearch} isLoading={loadingText} />
            </div>

            {error && (
              <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-100 rounded-xl text-center animate-fade-in">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {loadingText && (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-48 h-6 bg-slate-200 rounded mb-4"></div>
                <div className="w-full max-w-2xl h-32 bg-slate-200 rounded-xl"></div>
              </div>
            )}

            {data && !loadingText && (
              <ResultCard 
                data={data} 
                imageUrl={imageUrl} 
                isLoadingImage={loadingImage} 
                isFavorite={isCurrentFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </>
        ) : (
          <div className="animate-fade-in">
             <header className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900">Review Session</h2>
                <p className="text-slate-500 mt-2">Test your knowledge with smart flashcards.</p>
             </header>
             <ReviewModule favorites={favorites} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} UniLexicon. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;