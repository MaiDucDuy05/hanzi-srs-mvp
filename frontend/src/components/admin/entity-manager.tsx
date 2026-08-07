'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Input, Select } from '@/components/ui/form';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

export interface EntityField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface EntityConfig<T> {
  title: string;
  fetchList: () => Promise<T[]>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  /** Nếu có, hiện nút "Sửa" và chuyển modal sang chế độ cập nhật (P2-9). */
  update?: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  fields: EntityField[];
  initialForm: Record<string, string>;
  renderRow: (item: T) => ReactNode;
}

function toFormValue(item: unknown, key: string): string {
  const raw = (item as Record<string, unknown> | null)?.[key];
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'object') return JSON.stringify(raw);
  return String(raw);
}

/** Bảng CRUD đơn giản dùng chung cho các thực thể admin (thêm/sửa/xóa). */
export function EntityManager<T>({ config }: { config: EntityConfig<T> }) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(config.initialForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    config
      .fetchList()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(config.initialForm);
  };

  const startEdit = (item: T) => {
    const id = (item as { id?: string }).id;
    if (!id || !config.update) return;
    setEditingId(id);
    setForm(
      Object.fromEntries(
        config.fields.map((f) => [f.key, toFormValue(item, f.key)]),
      ),
    );
    setShowForm(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Record<string, unknown> = {};
      for (const f of config.fields) {
        const raw = form[f.key] ?? '';
        data[f.key] = f.type === 'number' ? (raw ? Number(raw) : null) : raw || null;
      }
      if (editingId) {
        await config.update?.(editingId, data);
      } else {
        await config.create(data);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: T) => {
    const id = (item as { id?: string }).id;
    if (!id) return;
    if (!window.confirm('Xóa mục này?')) return;
    try {
      await config.remove(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{config.title}</h2>
        <Button size="sm" onClick={() => setShowForm(true)}>+ Thêm</Button>
      </div>

      {loading && <PageLoading label="Đang tải..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100 ">
              {items.map((item) => (
                <li key={(item as { id: string }).id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">{config.renderRow(item)}</div>
                  <div className="flex shrink-0 gap-1">
                    {config.update && (
                      <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>
                        Sửa
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => remove(item)}>
                      Xóa
                    </Button>
                  </div>
                </li>
              ))}
              {items.length === 0 && (
                <li className="px-4 py-6 text-sm text-gray-500">Chưa có dữ liệu.</li>
              )}
            </ul>
          </CardBody>
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={closeForm}
        title={`${editingId ? 'Sửa' : 'Thêm'} ${config.title.toLowerCase()}`}
        footer={
          <>
            <Button variant="ghost" onClick={closeForm}>Hủy</Button>
            <Button form="entity-form" type="submit" loading={saving}>
              {editingId ? 'Cập nhật' : 'Lưu'}
            </Button>
          </>
        }
      >
        <form id="entity-form" onSubmit={submit} className="space-y-4">
          {config.fields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.type === 'select' ? (
                <Select
                  required={f.required}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                >
                  <option value="">— Chọn —</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  type={f.type === 'number' ? 'number' : 'text'}
                  required={f.required}
                  value={form[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </Field>
          ))}
        </form>
      </Modal>
    </div>
  );
}
