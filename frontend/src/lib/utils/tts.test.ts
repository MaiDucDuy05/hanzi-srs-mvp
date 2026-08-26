import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { speakText } from './tts';

class FakeSpeechSynthesisUtterance {
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  constructor(public text: string) {}
}

describe('speakText', () => {
  beforeEach(() => {
    (window as any).SpeechSynthesisUtterance = FakeSpeechSynthesisUtterance;
    (window as any).speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('không làm gì khi không có window.speechSynthesis', () => {
    const synth = (window as any).speechSynthesis;
    delete (window as any).speechSynthesis;
    expect(() => speakText('你好')).not.toThrow();
    (window as any).speechSynthesis = synth;
  });

  it('cancel trước khi speak', () => {
    const cancel = vi.fn();
    const speak = vi.fn();
    (window as any).speechSynthesis.cancel = cancel;
    (window as any).speechSynthesis.speak = speak;

    speakText('你好');

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it('đặt lang = zh-CN cho utterance', () => {
    let captured: FakeSpeechSynthesisUtterance | null = null;
    (window as any).speechSynthesis.speak = (u: FakeSpeechSynthesisUtterance) => {
      captured = u;
    };

    speakText('你好');

    expect(captured).not.toBeNull();
    expect(captured!.text).toBe('你好');
    expect(captured!.lang).toBe('zh-CN');
  });

  it('chọn voice zh đầu tiên nếu có', () => {
    const voices: SpeechSynthesisVoice[] = [
      { lang: 'en-US', name: 'English' } as SpeechSynthesisVoice,
      { lang: 'zh-CN', name: 'Chinese' } as SpeechSynthesisVoice,
      { lang: 'vi-VN', name: 'Vietnamese' } as SpeechSynthesisVoice,
    ];
    (window as any).speechSynthesis.getVoices = () => voices;

    let captured: FakeSpeechSynthesisUtterance | null = null;
    (window as any).speechSynthesis.speak = (u: FakeSpeechSynthesisUtterance) => {
      captured = u;
    };

    speakText('x');

    expect(captured!.voice?.lang).toBe('zh-CN');
  });

  it('fallback về voice zh-CN nếu chỉ có cmn', () => {
    const voices: SpeechSynthesisVoice[] = [
      { lang: 'cmn-Hans-CN', name: 'Mandarin' } as SpeechSynthesisVoice,
    ];
    (window as any).speechSynthesis.getVoices = () => voices;

    let captured: FakeSpeechSynthesisUtterance | null = null;
    (window as any).speechSynthesis.speak = (u: FakeSpeechSynthesisUtterance) => {
      captured = u;
    };

    speakText('x');
    expect(captured!.voice?.lang).toBe('cmn-Hans-CN');
  });
});
