import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Sign up' };

export default function SignUpPage(): React.ReactElement {
  return <SignUp />;
}
