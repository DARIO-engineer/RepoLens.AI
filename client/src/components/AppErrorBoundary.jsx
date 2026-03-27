import React from "react";

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("App crashed:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
          <div className="max-w-lg w-full p-6 rounded-2xl border border-warning/20 bg-warning/[0.06] text-center">
            <h1 className="text-lg font-semibold text-text mb-2">Algo correu mal</h1>
            <p className="text-sm text-text-muted mb-5">
              Ocorreu um erro ao carregar a aplicação. Tenta atualizar a página.
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Atualizar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
