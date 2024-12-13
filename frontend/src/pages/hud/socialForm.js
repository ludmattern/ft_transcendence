import { loadComponent } from "../../utils/dom_utils.js";
import { OtherProfileForm } from "../../components/otherProfileForm.js";

document.querySelector("#central-window").addEventListener("click", (e) => {
    if (e.target.matches("#other-profile-link")) {
        e.preventDefault();
        loadComponent("#central-window", OtherProfileForm, "", () => {
            console.info("OtherProfileForm loaded on click.");
        });
    }
});