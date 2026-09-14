import { Fragment, type ReactNode } from 'react';
import { useParams } from 'react-router';

interface RemountOnParamProps {
  name: string;
  children: ReactNode;
}

/** Пересоздаёт вложенную страницу, когда меняется выбранная route-сущность. */
export function RemountOnParam({ name, children }: RemountOnParamProps) {
  const params = useParams();
  return <Fragment key={params[name] ?? ''}>{children}</Fragment>;
}
