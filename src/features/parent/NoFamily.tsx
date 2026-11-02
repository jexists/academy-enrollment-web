import { EmptyState } from '@/components/ui/states';

/** 직접 가입했지만 아직 학원이 가족에 연결하지 않은 학부모 (결정6) */
export function NoFamily() {
  return <EmptyState message="아직 자녀가 연결되지 않았어요. 학원(02-000-0000)에 알려 주시면 자녀와 연결해 드려요." />;
}
