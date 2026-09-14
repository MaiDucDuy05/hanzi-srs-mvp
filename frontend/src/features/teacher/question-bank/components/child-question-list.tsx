import { useState } from 'react';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Trash2 } from 'lucide-react';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { QuestionRenderer } from '../../components/question-renderer';
import { ChildQuestionModal } from './child-question-modal';
import { ListTree, PlusCircle } from 'lucide-react';

interface ChildQuestionListProps {
  editId: string;
  children: QuestionBankItem[];
  setChildren: (children: QuestionBankItem[]) => void;
}

export function ChildQuestionList({ editId, children, setChildren }: ChildQuestionListProps) {
  const [showChildModal, setShowChildModal] = useState(false);

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
          <Button type="button" size="sm" onClick={() => setShowChildModal(true)} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
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
              <Button type="button" onClick={() => setShowChildModal(true)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <PlusCircle className="w-4 h-4 mr-2" /> Bắt đầu thêm câu hỏi con
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {children.map((child, idx) => (
                <div key={child.id} className="relative group p-5 border border-gray-200/60 rounded-2xl shadow-sm bg-white hover:border-emerald-200 transition-colors">
                  <QuestionRenderer question={{ question: child } as any} index={idx} />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" size="sm" variant="danger" onClick={async () => {
                      if (confirm('Bạn có chắc muốn xoá câu hỏi con này?')) {
                        await questionBankApi.remove(child.id);
                        questionBankApi.get(editId).then(q => setChildren(q.children || []));
                      }
                    }} className="h-8 w-8 p-0 rounded-full">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {showChildModal && (
        <ChildQuestionModal
          open={showChildModal}
          onClose={() => setShowChildModal(false)}
          parentId={editId}
          onSuccess={() => {
            questionBankApi.get(editId).then(q => setChildren(q.children || []));
          }}
        />
      )}
    </>
  );
}
