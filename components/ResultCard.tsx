import React from 'react';
import { DictionaryResult } from '../types';
import { SpeakerIcon, BookIcon, ImageIcon, StarIcon } from './Icons';

interface ResultCardProps {
  data: DictionaryResult;
  imageUrl: string | null;
  isLoadingImage: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  data, 
  imageUrl, 
  isLoadingImage, 
  isFavorite, 
  onToggleFavorite 
}) => {
  
  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto animate-fade-in pb-20">
      {/* Left Column: Text Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header: Word & Phonetic */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight capitalize">
                  {data.word}
                </h1>
                <button
                  onClick={onToggleFavorite}
                  className={`p-2 rounded-full transition-all duration-300 ${isFavorite ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <StarIcon className="w-8 h-8" filled={isFavorite} />
                </button>
              </div>
              
              <div className="flex items-center mt-3 space-x-3 text-slate-500">
                <span className="font-mono text-xl bg-slate-100 px-3 py-1 rounded-lg">/{data.phonetic}/</span>
                <button 
                   onClick={() => speakText(data.word)}
                   className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-full transition-colors flex items-center gap-2"
                   aria-label="Play pronunciation"
                >
                  <SpeakerIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">Pronounce</span>
                </button>
              </div>
            </div>
            {data.etymology && (
               <div className="text-sm text-slate-500 italic max-w-xs sm:text-right bg-slate-50 p-3 rounded-xl">
                 <span className="font-semibold block text-slate-400 text-xs mb-1 uppercase">Etymology</span>
                 {data.etymology}
               </div>
            )}
          </div>

          {/* Synonyms */}
          {data.synonyms.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {data.synonyms.map((syn, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full font-medium border border-indigo-100">
                  {syn}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meanings */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h2 className="flex items-center text-xl font-semibold text-slate-800 mb-6">
            <BookIcon className="w-6 h-6 mr-2 text-indigo-500" />
            Definitions
          </h2>
          <div className="space-y-6">
            {data.meanings.map((m, idx) => (
              <div key={idx} className="group">
                <div className="flex items-start">
                  <span className="shrink-0 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded mt-1 mr-4 border border-slate-200">
                    {m.partOfSpeech}
                  </span>
                  <p className="text-lg text-slate-700 leading-relaxed font-serif">
                    {m.definition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligent Examples */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Smart Context & Examples
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
              AI Selected
            </span>
          </div>
          <ul className="space-y-8">
            {data.examples.map((ex, idx) => (
              <li key={idx} className="relative pl-6 border-l-4 border-indigo-200 hover:border-indigo-500 transition-colors duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-lg text-slate-900 font-medium">"{ex.sentence}"</p>
                    <p className="text-slate-500">{ex.translation}</p>
                  </div>
                  <button 
                    onClick={() => speakText(ex.sentence)}
                    className="ml-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors shrink-0"
                    title="Listen to sentence"
                  >
                    <SpeakerIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {ex.usage && (
                   <div className="mt-3 flex items-start gap-2 bg-slate-50 p-3 rounded-lg text-sm">
                     <span className="shrink-0 text-indigo-500 font-bold text-xs uppercase tracking-wide mt-0.5">Usage Note</span>
                     <p className="text-slate-600 italic leading-relaxed">{ex.usage}</p>
                   </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Column: Visual Aid */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-auto">
             <h2 className="flex items-center text-lg font-semibold text-slate-800 mb-4">
              <ImageIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Visual Aid
            </h2>
            
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
              {isLoadingImage ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                   <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                   <p className="text-sm text-slate-500 animate-pulse">Generating illustration...</p>
                </div>
              ) : imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={`Illustration for ${data.word}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">Image unavailable</span>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-slate-400 text-center">
              AI-generated visualization provided by Gemini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
