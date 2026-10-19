import React, { useState } from 'react';
import type { ClassGroup } from '../../types';

interface Props {
  classes: ClassGroup[];
  onChange: (classes: ClassGroup[]) => boolean;
}

export function ClassManager({ classes, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [year, setYear] = useState('2026-2027');
  const [message, setMessage] = useState('');

  function save() {
    const cleanName = name.trim().toUpperCase();
    const cleanYear = year.trim();

    if (!cleanName || !cleanYear) {
      setMessage('Vui lòng nhập tên lớp và năm học.');
      return;
    }

    const duplicate = classes.some(
      c =>
        c.id !== editingId &&
        c.name.trim().toUpperCase() === cleanName &&
        c.schoolYear === cleanYear
    );

    if (duplicate) {
      setMessage('Lớp này đã có trong năm học đã chọn.');
      return;
    }

    const next = editingId
      ? classes.map(c =>
          c.id === editingId
            ? { ...c, name: cleanName, schoolYear: cleanYear }
            : c
        )
      : [
          ...classes,
          {
            id: crypto.randomUUID(),
            name: cleanName,
            schoolYear: cleanYear,
            studentCount: 0,
            students: [],
          },
        ];

    if (onChange(next)) {
      setEditingId(null);
      setName('');
      setMessage('Đã lưu lớp trên trình duyệt này.');
    }
  }

  function remove(cls: ClassGroup) {
    if (cls.studentCount > 0 || cls.students.length > 0) {
      setMessage(
        'Lớp đã có học sinh nên chưa cho xóa để giữ dữ liệu.'
      );
      return;
    }

    if (!window.confirm(`Xóa lớp ${cls.name}?`)) return;

    if (onChange(classes.filter(c => c.id !== cls.id))) {
      setMessage('Đã xóa lớp trống.');
      if (editingId === cls.id) {
        setEditingId(null);
        setName('');
      }
    }
  }

  const buttonStyle =
    'px-3 py-2 rounded-lg bg-cyan-700 text-white text-sm';

  return (
    <section className="rounded-2xl border border-slate-700 p-4 space-y-4">
      <h3 className="font-bold text-white">QUẢN LÝ LỚP HỌC</h3>

      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Tên lớp"
          placeholder="Tên lớp, ví dụ 12A3"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rounded-lg bg-slate-800 text-white p-2"
        />

        <input
          aria-label="Năm học"
          placeholder="2026-2027"
          value={year}
          onChange={e => setYear(e.target.value)}
          className="rounded-lg bg-slate-800 text-white p-2"
        />

        <button type="button" onClick={save} className={buttonStyle}>
          {editingId ? 'Lưu thay đổi' : '+ Thêm lớp'}
        </button>

        {editingId && (
          <button
            type="button"
            className={buttonStyle}
            onClick={() => {
              setEditingId(null);
              setName('');
              setMessage('');
            }}
          >
            Hủy sửa
          </button>
        )}
      </div>

      {message && <p role="status" className="text-amber-300">{message}</p>}

      {classes.map(cls => (
        <div
          key={cls.id}
          className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 pt-3"
        >
          <span className="text-white">
            {cls.name} · {cls.schoolYear} · {cls.studentCount} học sinh
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              className={buttonStyle}
              onClick={() => {
                if (cls.studentCount > 0 || cls.students.length > 0) {
                  setMessage(
                    'Chưa đổi tên lớp đã có học sinh để tránh lệch dữ liệu kết quả.'
                  );
                  return;
                }
                setEditingId(cls.id);
                setName(cls.name);
                setYear(cls.schoolYear);
                setMessage('');
              }}
            >
              Sửa
            </button>

            <button
              type="button"
              className="px-3 py-2 rounded-lg bg-red-800 text-white text-sm"
              onClick={() => remove(cls)}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
