import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; label: string; resetKey?: string }
type State = { error: Error | null; resetKey?: string }

/**
 * Catches a crash in one part of the page so the rest keeps working. The common case: the site was
 * redeployed while this tab was open, so a lazily loaded part (a sandbox engine) no longer exists
 * at its old address. Reloading fetches the new version.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Navigating elsewhere clears the error.
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null
  }

  render() {
    if (!this.state.error) return this.props.children
    const stale = /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(this.state.error.message)
    return (
      <div className="crash" role="alert">
        <p><b>{stale ? 'The school was updated while this page was open.' : `Something went wrong in the ${this.props.label}.`}</b></p>
        <p className="muted small">{stale ? 'Reload to get the new version. Your progress is kept.' : 'Reloading usually fixes it. Your progress is kept.'}</p>
        <button className="primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    )
  }
}
