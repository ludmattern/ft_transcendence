import { loadTabContent } from "../../components/sidewindow.js";

console.debug("Initializing the HUD and tab navigation for the side window");

// 1. Expander logic for the side window
const expanders = document.querySelectorAll(".side-window-expander");
const leftSideWindow = document.querySelector(".tab-content");

expanders.forEach((expander) => {
  expander.addEventListener("click", function () {
    this.classList.toggle("active");
  });
});

// 2. Function to check overflow in left side window
function checkOverflow() {
  if (leftSideWindow.scrollHeight > leftSideWindow.clientHeight) {
    leftSideWindow.classList.add("overflow");
  } else {
    leftSideWindow.classList.remove("overflow");
  }
}

checkOverflow();

// 3. Observe changes in the left side window for overflow updates
const observer = new MutationObserver(() => {
  checkOverflow();
});

observer.observe(leftSideWindow, {
  childList: true,
  subtree: true,
  characterData: true,
});

// 4. Tab navigation logic
const tabLinks = document.querySelectorAll(".nav-link a");
const tabContentContainer = document.getElementById("tab-content");

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const tabName = link.getAttribute("data-tab");

    // Set the clicked tab as active
    tabLinks.forEach((tabLink) => {
      tabLink.parentElement.classList.remove("active");
    });
    link.parentElement.classList.add("active");

    // Load the corresponding tab content
    loadTabContent(tabName, tabContentContainer);
  });
});

// Load the initial tab (INFO) on page load
loadTabContent("info", tabContentContainer);
