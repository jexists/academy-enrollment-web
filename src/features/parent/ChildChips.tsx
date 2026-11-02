'use client';

import { FilterChips } from '@/components/ui/FilterChips';
import type { Child } from './types';

/** 자녀 고르기 — 자녀가 한 명이면 이름만 보여 준다 */
export function ChildChips({ list, value, onChange }: { list: Child[]; value: number | null; onChange: (id: number) => void }) {
  if (list.length <= 1) {
    const only = list[0];
    return only ? <p className="text-body-sm text-muted">{only.name} · {only.gradeLabel}</p> : null;
  }
  return (
    <FilterChips
      options={list.map((c) => ({ value: c.id, label: `${c.name} ${c.gradeLabel}` }))}
      value={value ?? list[0].id}
      onChange={onChange}
    />
  );
}
