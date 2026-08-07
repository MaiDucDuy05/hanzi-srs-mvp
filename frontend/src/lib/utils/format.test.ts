import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatDuration, uuid } from './format';

describe('formatDuration', () => {
  it('định dạng phút:giây', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(3600)).toBe('60:00');
    expect(formatDuration(599)).toBe('09:59');
  });

  it('làm tròn xuống và không nhận số âm', () => {
    expect(formatDuration(64.9)).toBe('01:04');
    expect(formatDuration(-5)).toBe('00:00');
  });
});

describe('formatDate / formatDateTime', () => {
  it('trả về — khi không có giá trị hoặc ngày lỗi', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('invalid-date')).toBe('—');
    expect(formatDateTime(null)).toBe('—');
  });

  it('định dạng ngày kiểu dd/mm/yyyy', () => {
    const d = new Date(2024, 0, 15);
    expect(formatDate(d)).toMatch(/\d{2}\/\d{2}\/2024/);
    expect(formatDateTime(d)).toMatch(/\d{2}\/\d{2}\/2024/);
  });
});

describe('uuid', () => {
  it('sinh chuỗi không rỗng', () => {
    expect(uuid().length).toBeGreaterThan(0);
  });

  it('sinh giá trị khác nhau giữa các lần gọi', () => {
    const a = uuid();
    const b = uuid();
    expect(a).not.toBe(b);
  });
});
