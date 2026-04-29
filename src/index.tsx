import { render } from "solid-js/web";

const App = () => <div>sumida-stream-coffee</div>;

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

render(() => <App />, root);
