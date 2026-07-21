"use client";

import React, { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallbackTitle?: string };
type State = { hasError: boolean; error: Error | null };

export default class PageErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[PageErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {this.props.fallbackTitle || "Une erreur est survenue"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Veuillez rafraîchir la page ou réessayer plus tard.
          </p>
          <a
            href="/"
            className="px-6 py-3 rounded-xl bg-[#395886] text-white font-bold hover:bg-[#2b4c7e] transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
