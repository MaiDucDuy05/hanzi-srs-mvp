import { Input, Field, Select, Textarea } from '@/features/ui/components/form';
import { Button } from '@/features/ui/components/button';

export function SingleChoiceFields({ mcqText, setMcqText, mcqOptions, setMcqOptions, mcqCorrect, setMcqCorrect }: any) {
  return (
    <div className="space-y-4">
      <Field label="Nội dung câu hỏi">
        <Input required placeholder="VD: 你好 nghĩa là gì?" value={mcqText} onChange={e => setMcqText(e.target.value)} />
      </Field>
      <div className="space-y-2">
        <label className="text-sm font-medium">Các đáp án</label>
        {mcqOptions.map((opt: any, i: number) => (
          <div key={opt.id} className="flex gap-2 items-center">
            <input 
              type="radio" 
              name="mcqCorrect" 
              checked={mcqCorrect === opt.id} 
              onChange={() => setMcqCorrect(opt.id)} 
            />
            <span className="font-bold w-6">{opt.id}.</span>
            <Input 
              required 
              value={opt.text} 
              onChange={e => {
                const newOpts = [...mcqOptions];
                newOpts[i].text = e.target.value;
                setMcqOptions(newOpts);
              }} 
            />
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2">Chọn Radio button để đánh dấu đáp án đúng.</p>
      </div>
    </div>
  );
}

export function FillInFields({ fillInSentence, setFillInSentence, fillInAccepted, setFillInAccepted }: any) {
  return (
    <div className="space-y-4">
      <Field label="Câu hỏi (dùng ___ để tạo chỗ trống)">
        <Input required placeholder="我喜欢吃___。" value={fillInSentence} onChange={e => setFillInSentence(e.target.value)} />
      </Field>
      <Field label="Các đáp án chấp nhận (phân cách bằng dấu phẩy)">
        <Input required placeholder="苹果, píngguǒ" value={fillInAccepted} onChange={e => setFillInAccepted(e.target.value)} />
      </Field>
    </div>
  );
}

export function OrderingFields({ orderingWords, setOrderingWords }: any) {
  return (
    <div className="space-y-4">
      <Field label="Các từ theo đúng thứ tự (phân cách bằng dấu phẩy)">
        <Input required placeholder="我,喜欢,吃,苹果" value={orderingWords} onChange={e => setOrderingWords(e.target.value)} />
        <p className="text-xs text-gray-500 mt-1">Hệ thống sẽ tự động xáo trộn các từ này khi làm bài.</p>
      </Field>
    </div>
  );
}

export function MatchingFields({ matchingPairs, setMatchingPairs }: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Nhập các cặp từ tương ứng. Ít nhất 2 cặp.</p>
      {matchingPairs.map((pair: any, i: number) => (
        <div key={i} className="flex gap-2">
          <Input placeholder="Trái (VD: 苹果)" required value={pair.left} onChange={e => {
            const newP = [...matchingPairs]; newP[i].left = e.target.value; setMatchingPairs(newP);
          }} />
          <Input placeholder="Phải (VD: Táo)" required value={pair.right} onChange={e => {
            const newP = [...matchingPairs]; newP[i].right = e.target.value; setMatchingPairs(newP);
          }} />
          {i >= 2 && (
            <Button type="button" variant="ghost" onClick={() => setMatchingPairs(matchingPairs.filter((_: any, idx: number) => idx !== i))}>Xoá</Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => setMatchingPairs([...matchingPairs, {left:'', right:''}])}>
        + Thêm cặp
      </Button>
    </div>
  );
}

export function GroupFields({ mcqText, setMcqText }: any) {
  return (
    <div className="space-y-4">
      <Field label="Nội dung bài đọc / Đề bài chung *">
        <Textarea required placeholder="Nhập đoạn văn dùng chung cho các câu hỏi con..." value={mcqText} onChange={e => setMcqText(e.target.value)} rows={6} />
      </Field>
      <p className="text-sm text-gray-500">Sau khi lưu câu hỏi chùm (nhóm) này, bạn có thể thêm các câu hỏi con vào nhóm ở phần bên dưới.</p>
    </div>
  );
}

export function TrueFalseFields({ mcqText, setMcqText, trueFalseAnswer, setTrueFalseAnswer }: any) {
  return (
    <div className="space-y-4">
      <Field label="Nội dung câu hỏi *">
        <Input required placeholder="VD: 1 + 1 = 2" value={mcqText} onChange={e => setMcqText(e.target.value)} />
      </Field>
      <Field label="Đáp án đúng *">
        <Select value={trueFalseAnswer} onChange={e => setTrueFalseAnswer(e.target.value)}>
          <option value="true">Đúng (True)</option>
          <option value="false">Sai (False)</option>
        </Select>
      </Field>
    </div>
  );
}

export function ShortAnswerFields({ shortAnswerText, setShortAnswerText, shortAnswerAccepted, setShortAnswerAccepted }: any) {
  return (
    <div className="space-y-4">
      <Field label="Câu hỏi">
        <Input required placeholder="Nhập câu hỏi trả lời ngắn" value={shortAnswerText} onChange={e => setShortAnswerText(e.target.value)} />
      </Field>
      <Field label="Các đáp án đúng (phân cách bằng dấu phẩy)">
        <Input required placeholder="VD: táo, quả táo, apple" value={shortAnswerAccepted} onChange={e => setShortAnswerAccepted(e.target.value)} />
        <p className="text-xs text-gray-500 mt-1">Học sinh nhập đúng 1 trong các từ này sẽ được tính điểm.</p>
      </Field>
    </div>
  );
}
