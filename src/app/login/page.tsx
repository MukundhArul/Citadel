import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { SubmitButton } from './submit-button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string, mode?: string }>
}) {
  const { error, message, mode } = await searchParams;
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <Link href="/" className="absolute top-8 left-8 text-xs text-sci-green hover:text-sci-bone font-mono transition-colors">
        ← BACK TO TERMINAL
      </Link>
      
      <div className="w-full max-w-md border border-border bg-surface p-8" style={{ clipPath: "var(--clip-corner-md)" }}>
        <div className="mb-8">
          <div className="text-xs text-sci-amber tracking-[0.2em] mb-2 uppercase">
            {mode === 'register' ? 'INITIALIZATION SEQUENCE' : 'AUTHORIZATION REQUIRED'}
          </div>
          <h1 className="font-mono text-xl font-bold text-sci-green tracking-widest uppercase" style={{ textShadow: "var(--text-glow-green)" }}>
            {mode === 'register' ? 'CREATE NEW VAULT' : 'IDENTITY VERIFICATION'}
          </h1>
        </div>

        <form className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-xs text-sci-bone tracking-widest uppercase" htmlFor="email">
              Operator ID (Email)
            </label>
            <Input id="email" name="email" type="email" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-sci-bone tracking-widest uppercase" htmlFor="password">
              Access Code (Password)
            </label>
            <Input id="password" name="password" type="password" required />
          </div>

          {error && (
            <div className="text-sci-red text-xs mt-2 border border-sci-red p-2 bg-red-950/20 font-mono">
              [ERROR]: {error}
            </div>
          )}

          {message && (
            <div className="text-sci-green text-xs mt-2 border border-sci-green p-2 bg-green-950/20 font-mono">
              [SYSTEM]: {message}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            {mode === 'register' ? (
              <>
                <SubmitButton formAction={signup} variant="info" className="flex-1" loadingLabel="INITIALIZING...">
                  INITIALIZE VAULT
                </SubmitButton>
                <Button formAction={login} variant="ghost" className="flex-1 border border-transparent">
                  LOGIN INSTEAD
                </Button>
              </>
            ) : (
              <>
                <SubmitButton formAction={login} variant="exec" className="flex-1" loadingLabel="AUTHENTICATING...">
                  DECRYPT VAULT
                </SubmitButton>
                <Button formAction={signup} variant="ghost" className="flex-1 border border-transparent">
                  NEW VAULT
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
