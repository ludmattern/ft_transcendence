import { loadComponent } from "../../utils/dom_utils.js";
import { LoginForm } from "../../components/loginForm.js";

document.querySelector("#central-window").addEventListener("click", (e) => {
    if (e.target.matches("#login-link")) {
        e.preventDefault();
        loadComponent("#central-window", LoginForm, "loginForm", () => {
            console.debug("LoginForm loaded on click.");
        });
    }
});
