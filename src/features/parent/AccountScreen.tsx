'use client';

import { useState, type FormEvent } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/states';
import { useAuth } from '@/features/auth/AuthProvider';
import { ApiError, errorMessage } from '@/lib/api';
import { useApi, useMutate } from '@/lib/use-api';

interface Account {
  name: string;
  email: string;
  relation: '부' | '모' | null;
  phone: string | null;
  blockers: { active: { studentName: string; className: string; status: string }[]; unpaid: number };
}

/** 내 정보 · 회원 탈퇴 — final/screens/c-account. 탈퇴는 조건 확인 후 확인 Modal (결정29) */
export function AccountScreen() {
  const { signOut } = useAuth();
  const { data, setData } = useApi<Account>('/parent/account');
  const [editing, setEditing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [busy, setBusy] = useState(false);
  const mutate = useMutate();
  const toast = useToast();

  if (!data) return <Skeleton className="h-48" />;
  const blocked = data.blockers.active.length > 0 || data.blockers.unpaid > 0;

  return (
    <>
      <h1 className="text-page">내 정보</h1>
      <section className="flex flex-col">
        <Row label="이름" value={`${data.name}${data.relation ? ` (${data.relation})` : ''}`} />
        <Row label="이메일" value={data.email} />
        <Row label="연락처" value={data.phone ?? '—'} />
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            수정
          </Button>
          <ButtonLink href="/change-password" variant="secondary" size="sm">
            비밀번호 변경
          </ButtonLink>
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-2 border-t border-line pt-6">
        <h2 className="text-sec">회원 탈퇴</h2>
        <ul className="flex flex-col gap-1 text-body-sm">
          <li className={data.blockers.active.length ? 'text-err' : 'text-ok'}>
            {data.blockers.active.length
              ? `✕ 수강 중인 반이 있어요 — ${data.blockers.active.map((a) => `${a.studentName} ${a.className}`).join(', ')}`
              : '✓ 수강 중·환불 요청 중인 반 없음'}
          </li>
          <li className={data.blockers.unpaid ? 'text-err' : 'text-ok'}>
            {data.blockers.unpaid ? `✕ 이번 달 ${data.blockers.unpaid.toLocaleString('ko-KR')}원 미납` : '✓ 미납 없음'}
          </li>
        </ul>
        <p className="text-meta text-subtle">
          탈퇴하면 로그인할 수 없고, 다른 보호자 계정이 없으면 자녀 학생 계정도 함께 탈퇴돼요. 수강·출결·결제 기록은 학원 장부라 그대로 남아요.
        </p>
        <Button variant="ghost" className="self-start text-err" disabled={blocked} onClick={() => setWithdrawing(true)}>
          회원 탈퇴
        </Button>
        {blocked && <p className="text-meta text-subtle">수강이 끝나고 결제를 마친 뒤 탈퇴할 수 있어요.</p>}
      </section>

      {editing && (
        <EditDialog
          current={data}
          onClose={() => setEditing(false)}
          onSaved={(next) => {
            setData(next);
            setEditing(false);
            toast.success('저장했어요');
          }}
        />
      )}
      <Modal
        open={withdrawing}
        onClose={() => setWithdrawing(false)}
        title="정말 탈퇴할까요?"
        role="alertdialog"
        actions={
          <>
            <Button variant="secondary" onClick={() => setWithdrawing(false)}>
              닫기
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await mutate('/parent/account/withdraw', 'POST');
                  toast.success('탈퇴했어요');
                  signOut();
                } catch (reason) {
                  toast.error(errorMessage(reason));
                  setBusy(false);
                }
              }}
            >
              탈퇴
            </Button>
          </>
        }
      >
        되돌릴 수 없어요. 같은 이메일로 다시 가입할 수는 있어요.
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-12 items-center border-b border-line text-body-sm">
      <span className="w-20 text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EditDialog({ current, onClose, onSaved }: { current: Account; onClose: () => void; onSaved: (next: Account) => void }) {
  const [form, setForm] = useState({ name: current.name, phone: current.phone ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const mutate = useMutate();
  const toast = useToast();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      onSaved(await mutate<Account>('/parent/account', 'PATCH', form));
    } catch (reason) {
      if (reason instanceof ApiError && Object.keys(reason.fieldErrors).length > 0) setErrors(reason.fieldErrors);
      else toast.error(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="내 정보 수정"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
          <Button type="submit" form="account-edit" loading={busy}>
            저장
          </Button>
        </>
      }
    >
      <form id="account-edit" onSubmit={submit} className="flex flex-col gap-4">
        <TextField label="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <TextField label="연락처" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
      </form>
    </Modal>
  );
}
