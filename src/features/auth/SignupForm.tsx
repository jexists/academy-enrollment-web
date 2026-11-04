'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError, errorMessage } from '@/lib/api';
import type { Session } from '@/lib/auth-storage';
import { useAuth } from './AuthProvider';

/** 학부모 회원가입 — final/screens/c-signup. 학원에서 계정을 받았으면 가입하지 않고 로그인 */
export function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'new' | 'given'>('new');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', relation: '모' as '부' | '모' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (key: 'name' | 'email' | 'password' | 'phone') => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const session = await api<Session>('/auth/signup', { method: 'POST', body: form });
      signIn(session);
      toast.success('가입했어요');
      router.replace('/home');
    } catch (reason) {
      if (reason instanceof ApiError && Object.keys(reason.fieldErrors).length > 0) setErrors(reason.fieldErrors);
      else toast.error(errorMessage(reason));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-meta font-medium text-fg">어떤 경우세요?</span>
        <SegmentedControl
          options={[
            { value: 'new', label: '처음 가입해요' },
            { value: 'given', label: '학원에서 계정을 받았어요' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      {mode === 'given' ? (
        <div className="flex flex-col gap-4">
          <p className="text-body text-muted">학원에서 이미 계정을 받으셨다면 가입하지 말고 받은 이메일과 임시 비밀번호로 로그인해 주세요.</p>
          <Button size="lg" block onClick={() => router.push('/login')}>
            로그인
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <TextField label="이름" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
            <SegmentedControl
              label="관계"
              options={[
                { value: '모', label: '어머니' },
                { value: '부', label: '아버지' },
              ]}
              value={form.relation}
              onChange={(relation) => setForm({ ...form, relation })}
              className="mb-1"
            />
          </div>
          <TextField label="이메일" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
          <TextField
            label="비밀번호"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
          <TextField label="연락처" type="tel" placeholder="010-0000-0000" value={form.phone} onChange={set('phone')} error={errors.phone} />
          <Button type="submit" size="lg" block loading={busy} className="mt-2">
            가입
          </Button>
          <p className="text-meta text-subtle">가입한 뒤 학원에 알려 주시면 자녀와 연결해 드려요.</p>
        </form>
      )}
    </div>
  );
}
