import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardBody } from '@/features/ui/components/card';
import { Badge } from '@/features/ui/components/badge';
import { Button } from '@/features/ui/components/button';
import { GripVertical } from 'lucide-react';
import type { TestQuestion } from '@/lib/api/types';

interface SortableQuestionItemProps {
  question: TestQuestion;
  index: number;
  onDelete: (q: TestQuestion) => void;
}

function SortableQuestionItem({ question, index, onDelete }: SortableQuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <Card>
        <CardBody className="py-3 px-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
            >
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {index + 1}. {question.content}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-gray-500">
                <Badge tone="blue">{question.questionType}</Badge>
                <span>{question.points} điểm</span>
                {question.options && (
                  <span>{(question.options as { list?: unknown[] }).list?.join(' | ')}</span>
                )}
                {question.correctAnswer && (
                  <span className="text-green-600">✓ {JSON.stringify(question.correctAnswer)}</span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onDelete(question)}>
              Xóa
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

interface SortableQuestionListProps {
  questions: TestQuestion[];
  onReorder: (newOrder: TestQuestion[]) => void;
  onDelete: (q: TestQuestion) => void;
}

export function SortableQuestionList({ questions, onReorder, onDelete }: SortableQuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onReorder(arrayMove(questions, oldIndex, newIndex));
    }
  };

  if (questions.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">Chưa có câu hỏi nào.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {questions.map((q, index) => (
            <SortableQuestionItem key={q.id} question={q} index={index} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
