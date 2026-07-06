# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the CRA2 React Native (Expo) app. A PostHog client singleton was created at `apps/mobile/src/lib/posthog.ts` using `EXPO_PUBLIC_` environment variables. The root layout (`_layout.tsx`) was wrapped with `PostHogProvider` with touch autocapture enabled. Ten events were added across six files covering the full user journey: landing, authentication, profile management, and avatar upload. User identification (`posthog.identify`) is called on successful sign-in and registration, and `posthog.reset()` is called on sign-out.

| Event name | Description | File |
|---|---|---|
| `get_started_tapped` | User taps the Get Started button on the landing screen. | `apps/mobile/src/app/index.tsx` |
| `user_signed_in` | User successfully signs in with email and password. | `apps/mobile/src/components/SignInForm.tsx` |
| `sign_in_failed` | User's sign-in attempt fails due to an error. | `apps/mobile/src/components/SignInForm.tsx` |
| `sign_up_redirect_tapped` | User taps the 'Don't have an account? Sign Up' link on the login screen. | `apps/mobile/src/components/SignInForm.tsx` |
| `user_registered` | User successfully creates a new account. | `apps/mobile/src/components/SignUpForm.tsx` |
| `registration_failed` | User's registration attempt fails due to an error. | `apps/mobile/src/components/SignUpForm.tsx` |
| `sign_in_redirect_tapped` | User taps the 'Already have an account? Sign In' link on the register screen. | `apps/mobile/src/components/SignUpForm.tsx` |
| `profile_updated` | User successfully updates their profile username and/or website. | `apps/mobile/src/components/Account.tsx` |
| `user_signed_out` | User signs out of their account. | `apps/mobile/src/components/Account.tsx` |
| `avatar_uploaded` | User successfully uploads a new profile avatar image. | `apps/mobile/src/components/Avatar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/494442/dashboard/1788761)
- [Sign-ins & Registrations](https://us.posthog.com/project/494442/insights/e7wzd3Ae)
- [Registration Conversion Funnel](https://us.posthog.com/project/494442/insights/Hxwqz2Ii)
- [Auth Failures](https://us.posthog.com/project/494442/insights/RhZFqaUf)
- [Profile Engagement](https://us.posthog.com/project/494442/insights/BRmYLN17)
- [User Churn (Sign-outs)](https://us.posthog.com/project/494442/insights/Fm4FmZoG)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
