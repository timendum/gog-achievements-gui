import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { electrobun } from "./electrobun";

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(
		<StrictMode>
			<App electrobun={electrobun} />
		</StrictMode>,
	);
} else {
	document.title = "Fix HTML!";
}
