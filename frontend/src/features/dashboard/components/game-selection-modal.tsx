import { DecorativeLeaves } from './game-icons';

export const GAMES = [
  { id: 'balloon', title: 'Balloon', icon: <img src="/assets/game/ballon.png" alt="Balloon" className="w-full h-full object-contain" /> },
  { id: 'match', title: 'Match', icon: <img src="/assets/game/match.png" alt="Match" className="w-full h-full object-contain" /> },
  { id: 'memory', title: 'Memory', icon: <img src="/assets/game/memory.png" alt="Memory" className="w-full h-full object-contain" /> },
  { id: 'sentence', title: 'Sentence', icon: <img src="/assets/game/sentence.png" alt="Sentence" className="w-full h-full object-contain" /> },
  { id: 'stroke', title: 'Stroke', icon: <img src="/assets/game/stroke.png" alt="Stroke" className="w-full h-full object-contain" /> },
  { id: 'listening', title: 'Listening', icon: <img src="/assets/game/listen.png" alt="Listening" className="w-full h-full object-contain" /> },
];

interface GameSelectionModalProps {
  selectedLesson: { id: string; title: string };
  onClose: () => void;
  onGameSelect: (gameId: string) => void;
}

export function GameSelectionModal({ selectedLesson, onClose, onGameSelect }: GameSelectionModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#215b3b] font-heading">Practice <span className="text-[#8bc34a]">"{selectedLesson.title}"</span></h2>
          <p className="text-gray-500 mt-2 text-lg font-medium">Which game would you like to play?</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GAMES.map((game) => (
            <button key={game.id} onClick={() => onGameSelect(game.id)} className="bg-white rounded-[2rem] p-6 shadow-sm border-4 border-transparent hover:border-[#aadd4a] bg-[#f9fdf5] hover:bg-white transition-all hover:shadow-md flex flex-col items-center justify-center text-center relative group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"><DecorativeLeaves /></div>
              <div className="h-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
              <h3 className="text-lg font-bold text-[#111] mt-2 group-hover:text-[#4a6b38] transition-colors">{game.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
