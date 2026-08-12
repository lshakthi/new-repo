const tabs = [...document.querySelectorAll("[data-tab]")];
const panels = [...document.querySelectorAll("[data-panel]")];

const activateTab = (name, shouldFocus = false) => {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === name;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    if (isActive && shouldFocus) tab.focus();
  });
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
  document.querySelectorAll("[data-current-only]").forEach((section) => {
    section.hidden = name !== "current";
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
  tab.addEventListener("keydown", (event) => {
    let target = null;
    if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      target = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = tabs.length - 1;
    if (target !== null) {
      event.preventDefault();
      activateTab(tabs[target].dataset.tab, true);
    }
  });
});

document.querySelectorAll("[data-open-tab]").forEach((link) => {
  link.addEventListener("click", () => activateTab(link.dataset.openTab));
});

document.querySelectorAll(".goal-toggle").forEach((toggle) => {
  toggle.setAttribute("aria-expanded", "true");
  toggle.nextElementSibling.hidden = false;
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.nextElementSibling.hidden = isOpen;
  });
});

document
  .querySelector("[data-print]")
  .addEventListener("click", () => window.print());
