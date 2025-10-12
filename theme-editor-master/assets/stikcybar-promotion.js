// 电脑端的滚动处理函数
function desktopScrollFunction() {
    var menu = document.querySelector(".section-header");
    var fullwidth = document.querySelector(".stickyNavigation");
    var targetSection = document.getElementById("shopify-section-template--23913512927500__custom_two_colum_banner_Peq7dK");
    var targetBottom = targetSection.offsetTop + targetSection.offsetHeight;

    window.onscroll = function () {
        var scrollY = window.pageYOffset;

        if (scrollY > targetBottom) {
            if (fullwidth.style.position !== "fixed") {
                menu.style.transition = "top 0.3s ease";
                menu.style.top = "-70px"; 
                fullwidth.style.position = "fixed"; 
                fullwidth.style.top = "0"; 
            }
        } else {
            if (scrollY < targetBottom && fullwidth.style.position !== "static") {
                menu.style.transition = "top 0.3s ease";
                menu.style.top = "0"; 
                fullwidth.style.position = "static"; 
            }
        }
    };
}

// 移动端的滚动处理函数
function mobileScrollFunction() {
    var menu = document.querySelector(".section-header");
    var fullwidth = document.querySelector(".stickyNavigation");
    var sticky = menu.offsetTop;

    window.onscroll = function () {
        if (window.pageYOffset > sticky) {
            menu.style.top = "-70px";
            fullwidth.style.position = "fixed";
            fullwidth.style.top = "0";
        } else {
            menu.style.top = "0";
            fullwidth.style.position = "static";
        }
    };
}

// 根据设备尺寸调用相应的函数
function initializeScrollFunction() {
    if (window.matchMedia("(max-width: 768px)").matches) {
        mobileScrollFunction(); // 调用移动端处理函数
    } else {
        desktopScrollFunction(); // 调用电脑端处理函数
    }
}

// 初始化滚动处理
initializeScrollFunction();
