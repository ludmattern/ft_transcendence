import { loadComponent } from "../../utils/dom_utils.js";
import { DeleteAccountForm } from "../../components/deleteAccountForm.js";

document.querySelector("#central-window").addEventListener("click", (e) => {
    if (e.target.matches("#delete-account-link")) {
        e.preventDefault();
        loadComponent("#central-window", DeleteAccountForm, "", () => {
            console.debug("LoginForm loaded on click.");
        });
    }
});
