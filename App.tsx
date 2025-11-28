
import React, { useState, useCallback } from 'react';
import { GameState, WordItem, NounType } from './types';
import { generateWordList } from './services/geminiService';
import { FlashCard } from './components/FlashCard';
import { ArrowRight, Trophy, RefreshCcw, Gamepad2, Star, PartyPopper, Frown, Sparkles } from 'lucide-react';
import { initAudio, playPop, playCorrect, playWrong, playWin } from './utils/sound';

// Topic Configuration with kid-friendly colors
const TOPICS = [
  { id: 'Food & Drink', label: '🍔 美食', color: 'bg-orange-400 hover:bg-orange-500 border-orange-700' },
  { id: 'Animals', label: '🦁 动物', color: 'bg-amber-400 hover:bg-amber-500 border-amber-700' },
  { id: 'School', label: '🎒 学校', color: 'bg-blue-400 hover:bg-blue-500 border-blue-700' },
  { id: 'Home', label: '🏠 家里', color: 'bg-pink-400 hover:bg-pink-500 border-pink-700' }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [topic, setTopic] = useState<string>(TOPICS[0].id);
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Initialize Game
  const startGame = async () => {
    initAudio(); // Resume AudioContext for browser policy
    playPop();
    setGameState(GameState.LOADING);
    const newWords = await generateWordList(topic);
    setWords(newWords);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setGameState(GameState.PLAYING);
    playPop(); // Sound when game starts
  };

  const handleTopicSelect = (id: string) => {
    initAudio();
    playPop();
    setTopic(id);
  };

  // Handle User Choice
  const handleChoice = useCallback((selectedType: NounType) => {
    if (gameState !== GameState.PLAYING || showFeedback) return;

    const currentWord = words[currentIndex];
    const isCorrect = currentWord.type === selectedType;

    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      playCorrect();
      setScore(prev => prev + 10 + (streak * 2)); // Streak bonus
      setStreak(prev => prev + 1);
    } else {
      playWrong();
      setStreak(0);
    }

    // Auto advance
    setTimeout(() => {
      setShowFeedback(false);
      setLastAnswerCorrect(null);
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        playPop(); // Sound for new card
      } else {
        playWin();
        setGameState(GameState.GAME_OVER);
      }
    }, 2000); // Slightly shorter delay for snappier feel
  }, [currentIndex, gameState, words, streak, showFeedback]);

  // MENU SCREEN
  if (gameState === GameState.MENU) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_12px_0_rgba(0,0,0,0.1)] border-4 border-slate-800 p-8 text-center animate-pop-in relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-yellow-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-[-30px] left-[-30px] w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>
          
          <div className="mb-6 animate-float">
            <h1 className="text-5xl font-black text-slate-800 text-shadow tracking-tight">
              <span className="text-orange-400">量</span>
              <span className="text-blue-400">词</span>
              <span className="text-green-400">大</span>
              <span className="text-pink-400">冲</span>
              <span className="text-purple-400">关</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2 text-lg">Countable vs Uncountable</p>
          </div>

          <div className="text-left mb-8">
            <p className="text-center text-slate-500 font-black mb-4 uppercase tracking-widest text-sm">选择一个好玩的主题</p>
            <div className="grid grid-cols-2 gap-4">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTopicSelect(t.id)}
                  className={`
                    p-4 rounded-2xl text-lg font-black text-white transition-all transform active:scale-95 border-b-4
                    flex items-center justify-center shadow-lg
                    ${topic === t.id ? `${t.color} scale-105 ring-4 ring-offset-2 ring-slate-200` : 'bg-slate-200 border-slate-300 text-slate-400 hover:bg-slate-300'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-green-500 hover:bg-green-400 border-b-8 border-green-700 active:border-b-0 active:translate-y-2 text-white text-2xl font-black py-4 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 group"
          >
            <Gamepad2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            开始游戏!
          </button>
        </div>
      </div>
    );
  }

  // LOADING SCREEN
  if (gameState === GameState.LOADING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin text-5xl mb-4">🍩</div>
        <p className="text-2xl font-black text-slate-600 animate-pulse">正在准备卡片...</p>
      </div>
    );
  }

  // GAME OVER SCREEN
  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-800/80 backdrop-blur-sm fixed inset-0 z-50">
        <div className="bg-white p-8 rounded-[3rem] text-center max-w-sm w-full animate-pop-in border-8 border-yellow-400 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <Trophy size={80} className="mx-auto text-yellow-400 mb-4 animate-float" strokeWidth={2.5} />
          <h2 className="text-4xl font-black text-slate-800 mb-2">太棒了!</h2>
          <p className="text-slate-500 font-bold mb-8">所有的单词都复习完啦</p>
          
          <div className="bg-slate-100 rounded-3xl p-6 mb-8 border-4 border-slate-200">
            <div className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">最终得分</div>
            <div className="text-6xl font-black text-slate-700">{score}</div>
          </div>

          <button
            onClick={() => {
              playPop();
              setGameState(GameState.MENU);
            }}
            className="w-full bg-blue-500 hover:bg-blue-400 border-b-8 border-blue-700 active:border-b-0 active:translate-y-2 text-white font-black py-4 rounded-2xl text-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={24} strokeWidth={3} /> 再玩一次
          </button>
        </div>
      </div>
    );
  }

  // PLAYING SCREEN
  const currentWord = words[currentIndex];
  const progress = ((currentIndex) / words.length) * 100;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative overflow-hidden">
      
      {/* Header / HUD */}
      <div className="p-4 pt-6 flex items-center gap-4 z-10">
        <button 
          onClick={() => {
            playPop();
            setGameState(GameState.MENU);
          }} 
          className="bg-white p-3 rounded-2xl border-b-4 border-slate-200 text-slate-400 hover:scale-105 transition"
        >
            <ArrowRight className="rotate-180" size={24} strokeWidth={3} />
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 h-6 bg-slate-200 rounded-full border-2 border-slate-300 relative overflow-hidden">
            <div 
                className="h-full bg-green-400 transition-all duration-500 rounded-l-full"
                style={{ width: `${progress}%` }}
            ></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Progress {currentIndex + 1}/{words.length}
            </div>
        </div>

        {/* Score */}
        <div className="bg-white px-4 py-2 rounded-2xl border-b-4 border-slate-200 flex items-center gap-2">
             <Star className="fill-yellow-400 text-yellow-400" size={20} />
             <span className="font-black text-slate-700 text-xl">{score}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center relative pb-8">
        
        {/* Card Container */}
        <div className="w-full relative mb-6 z-10 flex justify-center perspective-1000">
           <FlashCard item={currentWord} isVisible={!showFeedback} />
           
           {/* Feedback Overlay */}
           {showFeedback && (
              <div className={`
                absolute inset-0 w-full rounded-[2.5rem] shadow-2xl border-8 flex flex-col items-center justify-center z-20 bg-white
                animate-pop-in px-4 text-center
                ${lastAnswerCorrect ? 'border-green-400' : 'border-red-400'}
              `}>
                  {lastAnswerCorrect ? (
                      <>
                        <PartyPopper size={64} className="text-green-500 mb-4 animate-bounce" />
                        <h2 className="text-4xl font-black text-green-500 mb-2">Bingo!</h2>
                        <div className="bg-green-100 px-6 py-3 rounded-2xl border-2 border-green-200">
                             <p className="text-green-700 font-bold text-lg">
                                {currentWord.type === 'countable' 
                                    ? "Yes! Many / A few" 
                                    : "Yes! Much / A little"}
                            </p>
                        </div>
                      </>
                  ) : (
                      <>
                        <Frown size={64} className="text-red-400 mb-4 animate-bounce" />
                        <h2 className="text-4xl font-black text-red-400 mb-2">Oops!</h2>
                        <div className="bg-red-50 px-6 py-3 rounded-2xl border-2 border-red-100">
                             <p className="text-red-500 font-bold text-lg">
                                {currentWord.type === 'countable' 
                                    ? "Try: Many / A few" 
                                    : "Try: Much / A little"}
                            </p>
                            <p className="text-slate-400 text-sm mt-1 font-bold">
                                {currentWord.type === 'countable' ? "这是一个可数名词" : "这是一个不可数名词"}
                            </p>
                        </div>
                      </>
                  )}
              </div>
           )}
        </div>

        {/* Big Buttons */}
        <div className="w-full grid grid-cols-2 gap-4 mt-auto">
          {/* Countable Button */}
          <button
            onClick={() => handleChoice('countable')}
            disabled={showFeedback}
            className={`
              relative group h-40 rounded-[2.5rem] transition-all transform active:scale-95 shadow-lg border-b-8 overflow-hidden
              flex flex-col items-center justify-center
              ${showFeedback 
                ? (currentWord.type === 'countable' ? 'bg-green-400 border-green-600' : 'bg-slate-200 border-slate-300 opacity-50')
                : 'bg-blue-400 hover:bg-blue-300 border-blue-600'
              }
            `}
          >
            <div className="absolute top-[-20px] left-[-20px] w-20 h-20 bg-white opacity-20 rounded-full"></div>
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🔢</div>
            <div className="text-white font-black text-xl">Countable</div>
            <div className="text-blue-100 font-bold text-sm">可数 (1, 2, 3...)</div>
          </button>

          {/* Uncountable Button */}
          <button
            onClick={() => handleChoice('uncountable')}
            disabled={showFeedback}
            className={`
              relative group h-40 rounded-[2.5rem] transition-all transform active:scale-95 shadow-lg border-b-8 overflow-hidden
              flex flex-col items-center justify-center
              ${showFeedback 
                ? (currentWord.type === 'uncountable' ? 'bg-green-400 border-green-600' : 'bg-slate-200 border-slate-300 opacity-50')
                : 'bg-pink-400 hover:bg-pink-300 border-pink-600'
              }
            `}
          >
             <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-white opacity-20 rounded-full"></div>
             <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">💧</div>
             <div className="text-white font-black text-xl">Uncountable</div>
             <div className="text-pink-100 font-bold text-sm">不可数 (Much)</div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
