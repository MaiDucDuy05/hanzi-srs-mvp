import { useState } from 'react';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Trash2 } from 'lucide-react';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { QuestionRenderer } from '../../components/question-renderer';
import { ChildQuestionModal } from './child-question-modal';
import { ListTree, PlusCircle, GripVertical } from 'lucide-react';
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

interface SortableChildQuestionProps {
  child: QuestionBankItem;
  idx: number;
  onEdit: (child: QuestionBankItem) => void;
  onDelete: (id: string) => void;
}

function SortableChildQuestion({ child, idx, onEdit, onDelete }: SortableChildQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: child.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group p-5 border rounded-2xl shadow-sm bg-white transition-colors flex gap-4 items-start ${isDragging ? 'border-emerald-500 shadow-md ring-2 ring-emerald-200' : 'border-gray-200/60 hover:border-emerald-200'}`}>
      <div {...attributes} {...listeners} className="mt-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-gray-100">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <QuestionRenderer question={{ question: child } as any} index={idx} />
      </div>
      
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(child)} className="h-8 w-8 p-0 rounded-full text-blue-600 border-blue-200 hover:bg-blue-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </Button>
        <Button type="button" size="sm" variant="danger" onClick={() => onDelete(child.id)} className="h-8 w-8 p-0 rounded-full">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface ChildQuestionListProps {
  editId: string;
  children: QuestionBankItem[];
  setChildren: (children: QuestionBankItem[]) => void;
}

export function ChildQuestionList({ editId, children, setChildren }: ChildQuestionListProps) {
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<QuestionBankItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = children.findIndex(c => c.id === active.id);
    const newIndex = children.findIndex(c => c.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(children, oldIndex, newIndex);
      
      // Update local state immediately for fast UI
      const updatedItems = newItems.map((item, idx) => ({ ...item, displayOrder: idx }));
      setChildren(updatedItems);
      
      // Update backend sequentially (or in parallel)
      try {
        await Promise.all(
          updatedItems.map((item, idx) => 
            questionBankApi.update(item.id, { displayOrder: idx } as any)
          )
        );
      } catch (err) {
        console.error('Failed to save order', err);
        // Fallback: re-fetch from server
        questionBankApi.get(editId).then(q => setChildren(q.children || []));
      }
    }
  };

  const sortedChildren = [...children].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-black/5">
        <div className="bg-emerald-50/50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ListTree className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-lg text-emerald-900">Các câu hỏi con <span className="ml-2 text-sm px-2 py-0.5 bg-emerald-200/50 text-emerald-700 rounded-full">{children.length}</span></h2>
          </div>
          <Button type="button" size="sm" onClick={() => { setEditingChild(null); setShowChildModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Thêm câu hỏi con
          </Button>
        </div>
        
        <CardBody className="p-6">
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-emerald-100 rounded-2xl bg-emerald-50/30">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <ListTree className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-emerald-900 mb-2">Chưa có câu hỏi con</h3>
              <p className="text-sm text-emerald-600 max-w-sm mb-6">Bạn có thể tạo thêm các câu hỏi trắc nghiệm, điền từ, trả lời ngắn,... thuộc về nhóm này.</p>
              <Button type="button" onClick={() => { setEditingChild(null); setShowChildModal(true); }} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <PlusCircle className="w-4 h-4 mr-2" /> Bắt đầu thêm câu hỏi con
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {sortedChildren.map((child, idx) => (
                    <SortableChildQuestion 
                      key={child.id} 
                      child={child} 
                      idx={idx} 
                      onEdit={(c) => { setEditingChild(c); setShowChildModal(true); }}
                      onDelete={async (id) => {
                        if (confirm('Bạn có chắc muốn xoá câu hỏi con này?')) {
                          await questionBankApi.remove(id);
                          questionBankApi.get(editId).then(q => setChildren(q.children || []));
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardBody>
      </Card>

      {showChildModal && (
        <ChildQuestionModal
          open={showChildModal}
          onClose={() => { setShowChildModal(false); setEditingChild(null); }}
          parentId={editId}
          editChild={editingChild}
          onSuccess={(child) => {
            if (editingChild) {
              setChildren(children.map(c => c.id === child.id ? child : c));
            } else {
              setChildren([...children, child]);
            }
          }}
        />
      )}
    </>
  );
}
