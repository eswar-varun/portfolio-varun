import { useState } from 'react';
import { profile } from '../data/profile';
import { Check, Copy } from './Icons';

export async function copyEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(profile.email);
    return true;
  } catch {
    return false;
  }
}

export function CopyEmail({ className = 'btn btn-ghost' }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (await copyEmail()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {copied ? <Check /> : <Copy />}
      <span>{copied ? 'Copied to clipboard' : profile.email}</span>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied' : ''}
      </span>
    </button>
  );
}
