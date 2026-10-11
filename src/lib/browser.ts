import { profile } from '../data/profile';

export async function copyEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(profile.email);
    return true;
  } catch {
    return false;
  }
}
