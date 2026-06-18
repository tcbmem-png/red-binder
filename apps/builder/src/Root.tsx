import { App } from './App';
import { SiteLayout } from './components/SiteLayout';
import { usePath } from './lib/router';
import { matchRoute } from './lib/routes';
import { HowItWorks } from './pages/HowItWorks';
import { HowItsBuilt } from './pages/HowItsBuilt';
import { StartOne } from './pages/StartOne';

/**
 * Top-level route switch. The builder (`/`) owns its own chrome and the EN/ES toggle; the static
 * content pages share SiteLayout. Unknown paths fall back to the builder.
 */
export function Root() {
  const route = matchRoute(usePath());
  switch (route) {
    case 'how-it-works':
      return (
        <SiteLayout>
          <HowItWorks />
        </SiteLayout>
      );
    case 'how-its-built':
      return (
        <SiteLayout>
          <HowItsBuilt />
        </SiteLayout>
      );
    case 'start-one':
      return (
        <SiteLayout>
          <StartOne />
        </SiteLayout>
      );
    default:
      return <App />;
  }
}
