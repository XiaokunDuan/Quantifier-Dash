import React from 'react';
import { WordItem } from '../types';
import { Lightbulb } from 'lucide-react';

interface FlashCardProps {
  item: WordItem;
  isVisible: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({ item, isVisible }) => {
  return (
    <div 
      className={`
        w-full max-w-sm aspect-[4/5] md:h-80 bg-white rounded-[2rem] shadow-[0_8px_0_rgba(0,0,0,0.1)] border-4 border-slate-800
        flex flex-col items-center justify-between p-6 text-center relative overflow-hidden
        transition-all duration-500 transform
        ${isVisible ? 'scale-100 opacity-100 translate-y-0 rotate-0' : 'scale-50 opacity-0 translate-y-20 rotate-12'}
      `}
    >
      {/* Decorative top pattern */}
      <div className="absolute top-0 left-0 w-full h-4 bg-sky-200 border-b-4 border-slate-800"></div>

      <div className="mt-6 flex flex-col items-center w-full flex-grow justify-center">
        <div className="inline-block bg-yellow-100 text-yellow-700 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border-2 border-yellow-300 mb-4 transform -rotate-2">
          Word Card
        </div>
        
        <h2 className="text-5xl font-black text-slate-800 mb-2 tracking-tight drop-shadow-sm">{item.word}</h2>
        <p className="text-2xl text-slate-400 font-bold mb-4">{item.translation}</p>
      </div>
      
      {/* Example Box */}
      <div className="w-full bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 relative group">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-slate-400">
            <Lightbulb size={20} className="fill-yellow-400 text-yellow-400" />
        </div>
        <p className="text-slate-600 font-bold text-lg leading-relaxed">
          {item.exampleSentence.split('___').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block w-12 border-b-4 border-dashed border-slate-300 mx-1"></span>
              )}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};