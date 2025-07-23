window.onscroll = function () {
  scrollFunction();
};

var menu = document.querySelector(".section-header");
var fullwidth = document.querySelector(".stickyNavigation");

var sticky = menu ? menu.offsetTop : 0;

function scrollFunction() {
  if (!menu || !fullwidth) return;
  
  if (window.pageYOffset > sticky) {
    menu.style.top = "-70px";
    fullwidth.style.position = "fixed";
    fullwidth.style.top = "0";
  } else {
    menu.style.top = "0";
    fullwidth.style.position = "static";
  }
}
const buttons = document.querySelectorAll(".btn.btn--large.add-to-cart");

if (buttons && buttons.length > 0) {
buttons.forEach((button) => {
  const newButton = document.createElement("button");
  newButton.className = "btn btn--large add-to-cart-mirror-btn";
  newButton.innerText = button.innerText;

  const buttonStyles = window.getComputedStyle(button);
  newButton.style.backgroundColor = buttonStyles.backgroundColor;
  newButton.style.color = buttonStyles.color;
  newButton.style.border = buttonStyles.border;
  newButton.style.borderRadius = buttonStyles.borderRadius;

  if (button.disabled) {
    newButton.disabled = true;
  }

  const buttonContainer = document.getElementById("buttonContainer");
  if (buttonContainer) {
    buttonContainer.appendChild(newButton);
  }

  newButton.addEventListener("click", function () {
    if (!newButton.disabled) {
      button.click();
    }
  });

  const observer = new MutationObserver(function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        (mutation.attributeName === "disabled" ||
          mutation.attributeName === "data-add-to-cart-text") &&
        mutation.target === button
      ) {
        newButton.innerText = button.innerText;
        newButton.disabled = button.disabled;
      }
    }
  });

  const config = { attributes: true };

  observer.observe(button, config);
});
}
