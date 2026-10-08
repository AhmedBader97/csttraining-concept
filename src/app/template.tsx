import { PageTransition } from '@/components/motion/PageTransition';

// A template remounts on every navigation, which replays the page transition.
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
