import { Component, type ReactNode } from 'react';

// Catches render/runtime errors thrown by children (e.g. the interactive chart)
// so one broken subtree can't take down the whole screen. `fallback` receives the
// error so the caller can show a usable alternative AND surface the message.
interface Props {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render(): ReactNode {
    if (this.state.error) return this.props.fallback(this.state.error);
    return this.props.children;
  }
}
