import React, { useState, useEffect } from 'react';
import { SavedWord } from '../types';
import { RefreshIcon, SpeakerIcon, ArrowRightIcon, StarIcon, CardIcon, ImageIcon } from './Icons';

interface ReviewModuleProps {
  favorites: SavedWord[];
}

const ReviewModule: React.FC<ReviewModuleProps> = ({ favorites }) => {
  const [cards, setCards] = useState<SavedWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize session
  useEffect(() => {
    startSession();
  }, [favorites]);

  const startSession = () => {
    if (favorites.length === 0) return;
    // Shuffle cards
    const shuffled = [...favorites].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setIsFinished(true);
    }
  };

  const speakText = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Prevent card flip
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <StarIcon className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Favorites Yet</h2>
        <p className="text-slate-500 max-w-md">
          Start searching for words and tap the star icon to add them to your collection. Your flashcards will appear here.
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="bg-green-100 p-6 rounded-full mb-6">
          <CardIcon className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Session Complete!</h2>
        <p className="text-slate-500 mb-8">You've reviewed {cards.length} words.</p>
        <button 
          onClick={startSession}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <RefreshIcon className="w-5 h-5" />
          Start New Session
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6 text-slate-500 text-sm font-medium">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className="flex items-center gap-1">
          <RefreshIcon className="w-4 h-4" />
          Tap card to flip
        </span>
      </div>

      <div 
        onClick={handleFlip}
        className="relative h-96 w-full perspective cursor-pointer group"
      >
        <div className={`relative w-full h-full duration-500 transform transition-all preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRONT */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center justify-center p-8 hover:shadow-2xl transition-shadow">
             <span className="absolute top-6 left-6 text-xs font-bold text-indigo-500 uppercase tracking-widest">Term</span>
             
             <h2 className="text-5xl font-bold text-slate-900 mb-4 text-center">{currentCard.word}</h2>
             
             <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="font-mono text-slate-600">/{currentCard.phonetic}/</span>
                <button 
                  onClick={(e) => speakText(e, currentCard.word)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <SpeakerIcon className="w-5 h-5 text-indigo-600" />
                </button>
             </div>
             <p className="absolute bottom-8 text-slate-400 text-sm animate-pulse">Tap to see meaning</p>
          </div>

          {/* BACK */}
          <div className="absolute w-full h-full backface-hidden bg-indigo-50 rounded-3xl shadow-xl border border-indigo-100 rotate-y-180 flex flex-col p-8 overflow-y-auto custom-scrollbar">
             <span className="absolute top-6 left-6 text-xs font-bold text-indigo-500 uppercase tracking-widest">Definition</span>
             
             <div className="mt-8 space-y-4 flex-grow">
               {/* Show Image if available */}
               {currentCard.imageUrl && (
                 <div className="w-24 h-24 rounded-lg overflow-hidden float-right ml-4 mb-2 border border-white shadow-sm">
                   <img src={currentCard.imageUrl} alt="" className="w-full h-full object-cover" />
                 </div>
               )}

               {currentCard.meanings.slice(0, 2).map((m, idx) => ( // Show top 2 meanings
                 <div key={idx}>
                   <span className="text-xs font-bold bg-white text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 mr-2">
                     {m.partOfSpeech}
                   </span>
                   <span className="text-slate-800 font-medium leading-relaxed">
                     {m.definition}
                   </span>
                 </div>
               ))}
               
               {currentCard.examples.length > 0 && (
                 <div className="mt-6 pt-4 border-t border-indigo-100">
                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Example</p>
                   <p className="text-slate-700 italic">"{currentCard.examples[0].sentence}"</p>
                   <p className="text-slate-500 text-sm mt-1">{currentCard.examples[0].translation}</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleNext}
          className="px-12 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
        >
          {currentIndex === cards.length - 1 ? 'Finish' : 'Next Word'}
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default ReviewModule;
