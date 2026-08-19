import { getLevel } from './level.util';

describe('getLevel', () => {
  it('L1: 0-99', () => {
    expect(getLevel(0).level).toBe(1);
    expect(getLevel(50).level).toBe(1);
    expect(getLevel(99).level).toBe(1);
  });

  it('L2: 100-299', () => {
    expect(getLevel(100).level).toBe(2);
    expect(getLevel(200).level).toBe(2);
    expect(getLevel(299).level).toBe(2);
  });

  it('L3: 300-599', () => {
    expect(getLevel(300).level).toBe(3);
    expect(getLevel(599).level).toBe(3);
  });

  it('L4: 600-999', () => {
    expect(getLevel(600).level).toBe(4);
    expect(getLevel(999).level).toBe(4);
  });

  it('L5: 1000-1499', () => {
    expect(getLevel(1000).level).toBe(5);
    expect(getLevel(1499).level).toBe(5);
    expect(getLevel(1500).level).toBe(5);
  });

  it('L6: 1500-1999 (+500/level sau L5)', () => {
    expect(getLevel(1501).level).toBe(6);
    expect(getLevel(1999).level).toBe(6);
    expect(getLevel(2000).level).toBe(6);
  });

  it('L7: 2000-2499', () => {
    expect(getLevel(2001).level).toBe(7);
    expect(getLevel(2500).level).toBe(7);
  });

  it('progress fraction đúng giữa 2 mốc', () => {
    const r = getLevel(150);
    expect(r.level).toBe(2);
    expect(r.currentLevelFloor).toBe(100);
    expect(r.nextLevelFloor).toBe(300);
    expect(r.progress).toBe(0.25);
    expect(r.expToNext).toBe(150);
  });

  it('negative totalExp → L1', () => {
    expect(getLevel(-100).level).toBe(1);
  });
});
