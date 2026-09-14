export function speakText(text: string, rate: number = 1) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = 
    voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn')) || 
    voices.find(v => v.lang.includes('zh-CN'));
    
  if (zhVoice) {
    utterance.voice = zhVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}
