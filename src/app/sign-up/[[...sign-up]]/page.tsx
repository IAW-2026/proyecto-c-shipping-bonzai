import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <h1 className="font-display text-4xl text-primary mb-2">
            The Living Archive
          </h1>
          <p className="font-sans text-sm text-secondary">
            Portal de Envíos Bonzai
          </p>
        </div>
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#03271a',
              colorBackground: '#faf9f4',
              colorText: '#1A2E22',
              colorTextSecondary: '#526347',
              colorInputBackground: '#ffffff',
              colorInputText: '#1A2E22',
              borderRadius: '0.75rem',
              fontFamily: 'var(--font-manrope), sans-serif',
            },
            elements: {
              card: 'shadow-none border-none bg-transparent mx-auto',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white w-full h-11 rounded-xl font-sans text-sm',
              formFieldInput: 'bg-white border border-outline-ghost h-11 rounded-xl px-4 text-sm w-full focus:ring-2 focus:ring-primary/20 focus:border-primary',
              formFieldLabel: 'font-sans text-sm text-secondary mb-1.5 block',
              footerActionLink: 'text-primary hover:text-primary/80 font-sans text-sm',
              identityPreviewEditButton: 'text-primary',
              formFieldErrorText: 'font-sans text-sm text-red-600 mt-1',
              alternativeMethodsBlockButton: 'border border-outline-ghost hover:bg-surface-low h-11 rounded-xl font-sans text-sm',
              socialButtonsBlockButton: 'border border-outline-ghost hover:bg-surface-low h-11 rounded-xl font-sans text-sm',
              dividerLine: 'bg-outline-ghost',
              dividerText: 'font-sans text-xs text-secondary uppercase tracking-wider',
              formResendCodeLink: 'text-primary font-sans text-sm',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'iconButton',
            },
          }}
          fallbackRedirectUrl="/operator/dashboard"
        />
      </div>
    </div>
  )
}
