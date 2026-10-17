import React, { useState, useEffect } from 'react';
import { Home } from './routes/Home';
import { Studio } from './routes/Studio';
import { View } from './routes/View';
import { Greeting } from './types/greeting';

type RouteState =
  | { type: 'home' }
  | { type: 'studio'; greeting?: Greeting }
  | { type: 'view'; greetingId?: string; inlineHash?: string };

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => {
    return parseCurrentRoute();
  });

  function parseCurrentRoute(): RouteState {
    const hash = window.location.hash || '';
    const path = window.location.pathname || '';
    const search = window.location.search || '';
    const searchParams = new URLSearchParams(search);

    // 1. Check query parameter ?g=<base64url>
    const queryG = searchParams.get('g');
    if (queryG) {
      return { type: 'view', inlineHash: queryG };
    }

    // 2. Check query parameter ?gId=<id> or ?id=<id>
    const queryGId = searchParams.get('gId') || searchParams.get('id');
    if (queryGId) {
      return { type: 'view', greetingId: queryGId };
    }

    // 3. Check path /g/:id
    const match = path.match(/^\/g\/([^\/\?#]+)/);
    if (match) {
      return { type: 'view', greetingId: decodeURIComponent(match[1]) };
    }

    // 4. Check inline hash #g=<base64url>
    if (hash.startsWith('#g=')) {
      const inlineHash = hash.replace(/^#g=/, '');
      return { type: 'view', inlineHash };
    }

    // 5. Check saved id hash #gId=<id> or #id=<id>
    if (hash.startsWith('#gId=')) {
      const greetingId = hash.replace(/^#gId=/, '');
      return { type: 'view', greetingId };
    }
    if (hash.startsWith('#id=')) {
      const greetingId = hash.replace(/^#id=/, '');
      return { type: 'view', greetingId };
    }

    return { type: 'home' };
  }

  // Listen to both hashchange and popstate (e.g. forward/back browser buttons, shared links)
  useEffect(() => {
    const handleNavigation = () => {
      setRoute(parseCurrentRoute());
    };
    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const goToHome = () => {
    if (window.location.pathname !== '/' || window.location.search || window.location.hash) {
      try {
        window.history.pushState(null, '', '/');
      } catch {
        window.location.hash = '';
      }
    }
    setRoute({ type: 'home' });
  };

  const goToStudio = (greetingToEdit?: Greeting) => {
    setRoute({ type: 'studio', greeting: greetingToEdit });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] font-sans antialiased selection:bg-[#E4C5A5]">
      {route.type === 'home' && (
        <Home
          onCreateNew={() => goToStudio()}
          onSelectSample={(sample) => goToStudio(sample)}
        />
      )}

      {route.type === 'studio' && (
        <Studio
          initialGreeting={route.greeting}
          onBackToHome={goToHome}
        />
      )}

      {route.type === 'view' && (
        <View
          greetingId={route.greetingId}
          inlineHash={route.inlineHash}
          onGoHome={goToHome}
          onCreateNew={() => goToStudio()}
          onEditGreeting={(greetingToEdit) => goToStudio(greetingToEdit)}
        />
      )}
    </div>
  );
}
