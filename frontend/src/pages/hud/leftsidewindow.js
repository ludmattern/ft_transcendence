import { loadTabContent } from "/src/components/leftSideWindow.js";

console.debug("Initializing the HUD and tab navigation for the side window");

const expanders = document.querySelectorAll(".left-side-window-expander");
const leftSideWindow = document.querySelector(".l-tab-content");

expanders.forEach((expander) => {
  expander.addEventListener("click", function () {
    this.classList.toggle("active");
    leftSideWindow.classList.toggle("well-hidden");
  });
});

const tabLinks = document.querySelectorAll(".l-side-window .nav-link a");
const tabContentContainer = document.getElementById("l-tab-content");
const window = document.getElementById("l-tab-content-container");

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const tabName = link.getAttribute("data-tab");

    tabLinks.forEach((tabLink) => {
      tabLink.parentElement.classList.remove("active");
    });
    link.parentElement.classList.add("active");

    loadTabContent(tabName, tabContentContainer, window);
  });
});

loadTabContent("info", tabContentContainer, window);
