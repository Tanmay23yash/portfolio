import { Component } from "react";

// If WebGL is unavailable or a 3D scene crashes, show a quiet glow instead
// of taking the whole page down.
export default class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <div className="scene-fallback" /> : this.props.children;
  }
}
