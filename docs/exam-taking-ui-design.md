# Exam Taking Layout - Optimal Design for Students

## Design Principles

**Mobile-First** → Optimized for all screen sizes
**Distraction-Free** → Focus on content only
**Time-Aware** → Timer always visible
**Progress-Transparent** → Know where you are
**Quick Navigation** → Easy question jumping
**Thumb-Friendly** → Touch targets optimized for phones

---

## Layout Structure

### **Header (Sticky)**
```
┌─────────────────────────────────────────┐
│  ← Exam Name  │  Câu: 5/25  │  10:45  │
└─────────────────────────────────────────┘
```
- **Left**: Back button + Exam title (truncated on mobile)
- **Center**: Current question count (e.g., "Câu 5/25")
- **Right**: Timer (red if < 5min)

### **Main Content Area**
```
┌─────────────────────────────────────────┐
│                                         │
│  Question Number + Type Badge           │
│  ─────────────────────────────────────  │
│                                         │
│  QUESTION TEXT (Large, readable)        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Answer Options / Input (Full Width)    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [Prev]  [Question Navigator]  [Next]  │
│                                         │
└─────────────────────────────────────────┘
```

### **Question Navigator (Drawer / Modal on Mobile)**
```
┌─ Question Grid ────────────────────┐
│ [1] [2] [3] [4] [5] [6] ...       │
│ [7] [8] [9] [10] [11] [12] ...    │
│                                    │
│ Legend:                            │
│ ⚪ Not answered    ✓ Answered      │
│ 🟡 Current question                │
│ ⚠️ Marked for review               │
└────────────────────────────────────┘
```

### **Footer Actions (Sticky)**
```
┌─────────────────────────────────────────┐
│  [Flag for Review] | [Submit Exam]     │
└─────────────────────────────────────────┘
```

---

## Component Breakdown

### **1. Header Bar** (h-16)
```tsx
<div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
  {/* Left: Back + Title */}
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="sm" onClick={handleBack}>
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <h1 className="font-bold text-gray-900 truncate">{exam.name}</h1>
  </div>

  {/* Center: Progress */}
  <div className="text-sm font-semibold text-gray-600">
    Câu {currentQuestion + 1}/{totalQuestions}
  </div>

  {/* Right: Timer */}
  <div className={cn(
    "font-mono font-bold text-lg",
    timeLeft < 300 ? "text-red-600" : "text-gray-900"
  )}>
    {formatTime(timeLeft)}
  </div>
</div>
```

### **2. Question Card** (Main Content)
```tsx
<div className="flex-1 overflow-y-auto p-4 sm:p-6">
  <Card className="max-w-3xl mx-auto">
    {/* Question Header */}
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
            {currentQuestion + 1}
          </span>
          <Badge>{getQuestionTypeLabel(question.type)}</Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleFlag}
        >
          <Flag className={cn("h-4 w-4", isMarked ? "fill-current text-amber-500" : "text-gray-400")} />
        </Button>
      </div>
      <p className="text-lg font-medium text-gray-900">
        {question.content.questionText}
      </p>
    </div>

    {/* Answer Area */}
    <div className="space-y-4">
      <QuestionRenderer 
        question={question} 
        value={answers[question.id]}
        onChange={handleAnswer}
      />
    </div>
  </Card>
</div>
```

### **3. Question Navigator**
```tsx
// Toggle with button on mobile, sidebar on desktop

<div className="grid grid-cols-5 sm:grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg">
  {questions.map((q, idx) => (
    <button
      key={q.id}
      onClick={() => goToQuestion(idx)}
      className={cn(
        "w-full aspect-square text-sm font-semibold rounded-lg transition-all",
        currentQuestion === idx && "ring-2 ring-blue-500 bg-blue-100 text-blue-600",
        answers[q.id] !== undefined && "bg-green-100 text-green-600",
        isMarked(q.id) && "bg-amber-100 text-amber-600",
        !answers[q.id] && "bg-gray-200 text-gray-600"
      )}
    >
      {idx + 1}
    </button>
  ))}
</div>
```

### **4. Navigation Buttons**
```tsx
<div className="flex justify-between gap-3 mt-6">
  <Button 
    variant="outline"
    disabled={currentQuestion === 0}
    onClick={() => goToQuestion(currentQuestion - 1)}
  >
    <ChevronLeft className="h-4 w-4 mr-1" /> Câu trước
  </Button>

  <Button
    variant="outline"
    onClick={toggleNavigator}
    className="flex-1"
  >
    Xem tất cả câu ({answeredCount}/{totalQuestions})
  </Button>

  <Button 
    disabled={currentQuestion === totalQuestions - 1}
    onClick={() => goToQuestion(currentQuestion + 1)}
  >
    Câu sau <ChevronRight className="h-4 w-4 ml-1" />
  </Button>
</div>
```

### **5. Submit Button (Floating)**
```tsx
<div className="fixed bottom-6 right-6 sm:relative sm:bottom-auto sm:right-auto">
  <Button 
    size="lg"
    onClick={handleSubmit}
    className="w-full"
  >
    <Send className="h-4 w-4 mr-2" />
    Nộp bài ({answeredCount}/{totalQuestions} đã trả lời)
  </Button>
</div>
```

---

## Responsive Breakpoints

### **Mobile (< 640px)**
- Header: Compact mode (hide title text if needed)
- Question: Full viewport minus header/footer
- Navigator: Modal/Drawer (bottom slide-up)
- Buttons: Stacked vertically
- Submit: Floating action button (FAB)

### **Tablet (640px - 1024px)**
- Split view possible (question + navigator side-by-side)
- Header: Full content
- Larger touch targets (48px buttons)

### **Desktop (> 1024px)**
- Two-column: Question (70%) + Navigator (30%)
- Header: Compact horizontal
- All buttons at bottom
- Wider question display

---

## Color Scheme

**Based on Hanzi SRS Green Theme:**

```css
--primary: #1f5333  /* Dark green */
--success: #22c55e  /* Green (answered) */
--warning: #f59e0b  /* Amber (marked) */
--danger: #ef4444   /* Red (timer < 5min) */
--neutral: #6b7280  /* Gray (not answered) */
--bg: #f9fafb       /* Light gray bg */
--border: #e5e7eb   /* Light border */
```

---

## UX Optimizations

### **Mobile**
✅ Large text (18px+ for questions)
✅ 48px+ touch targets (buttons)
✅ Minimal scrolling
✅ Bottom navigation (thumb zone)
✅ Full-width inputs
✅ Sticky header/footer

### **Accessibility**
✅ High contrast colors
✅ Semantic HTML
✅ Keyboard navigation
✅ Screen reader friendly
✅ Question navigator labels
✅ Status updates announced

### **Performance**
✅ Lazy load question navigator
✅ Memoize question renderer
✅ Virtual scroll for many questions
✅ Debounce answer saves
✅ Optimistic UI updates

---

## Question Type Variations

### **Single Choice**
- Full-width radio buttons
- Large touch targets
- Visual feedback on selection

### **True/False**
- Two prominent buttons
- Clear visual distinction

### **Fill in the Blank**
- Input field (full width)
- Character count visible

### **Ordering**
- Draggable cards (mobile-friendly)
- Number badges

### **Matching**
- Two-column layout
- Connect with lines (desktop) or select (mobile)

### **Short Answer**
- Textarea (expandable)
- Character limit shown

---

## State Indicators

**Question Status Colors:**
- ⚪ **Gray** - Not answered
- 🟢 **Green** - Answered
- 🟡 **Amber** - Marked for review  
- 🔵 **Blue** - Currently viewing

**Timer States:**
- 🟢 Green (normal)
- 🟡 Amber (< 10 min)
- 🔴 Red (< 5 min)
- ⚫ Black (time up → auto-submit)

---

## Flow Example

```
1. Enter Exam
   ↓
2. See Question 1 (Header: Câu 1/25 | Timer: 30:00)
   ↓
3. Answer Question
   ↓
4. Next Button → Question 2
   ↓
5. Click "Xem tất cả câu" → Navigator Modal
   ↓
6. Select Question 15 → Jump to it
   ↓
7. Flag for Review
   ↓
8. Submit Exam → Confirmation → Results
```

---

## Key Metrics for Success

📊 **Time to Answer First Question**: < 2 seconds
📊 **Time to Jump Between Questions**: < 1 second  
📊 **Error Rate on Mobile**: < 2%
📊 **Accidental Submissions**: < 0.1%
📊 **Navigation Clarity**: 95%+ find all questions easily
