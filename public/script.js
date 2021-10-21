/* -=-=-=-=-=-=-=-=-=-=-= Document Elements =-=-=-=-=-=-=-=-=-=-=- */
const navBar = document.querySelector(".nav-bar");
const navBarBtns = navBar.querySelectorAll("a");
const nowWordHome = document.querySelector(".now-title");
const oneWordSubtitle = document.querySelector(".one-word");
const learnMore = document.querySelector(".learn-more");
const arrows = document.querySelector(".arrows");
const navBarIcon = document.querySelector(".fas");
const body = document.querySelector("body");
const navBarMobile = document.querySelector(".nav-bar-icon");
const cardsFutureDoc = document.querySelectorAll(".doc-card ");
const aboutUsSection = document.getElementById("about-us");
const hearFromUsSection = document.getElementById("hear-from-us");
const tryItSection = document.getElementById("try-it");
const futureFunctionSection = document.getElementById("other-documents");
const tryItBtn = document.querySelector(".try-it-btn");
/* ---- Other variables ----*/
let navBarShowing = 0;
let oldPos = 0;
let navHeight = 0;
let btnClicked = 0;
/* -=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */

/* -=-=-=-=-=-=-=-=-=-=-= Nav Btns =-=-=-=-=-=-=-=-=-=-=- */

// Nav Bar elements:
navBarBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .getElementById(`${btn.textContent.replaceAll(" ", "-").toLowerCase()}`)
      .scrollIntoView({ behavior: "smooth" });
  });
});

// Other elements of the home section:
[nowWordHome, oneWordSubtitle].forEach((el) => {
  el.addEventListener("click", function () {
    document.getElementById(`try-it`).scrollIntoView({ behavior: "smooth" });
  });
});

[learnMore, arrows].forEach((el) => {
  el.addEventListener("click", function () {
    document.getElementById(`about-us`).scrollIntoView({ behavior: "smooth" });
  });
});

// When mobile, makes the navigation items show once you click the nav icon and disappear when clicking outside or scrolling:
navBarIcon.addEventListener("click", function () {
  if (window.innerWidth >= 770) return;
  navBar.style.transition = "transform 1s";
  navBar.style.transform = `translateX(${navBarShowing === 0 ? "0%" : "100%"})`;
  navBarShowing = navBarShowing === 0 ? 1 : 0;
});

body.addEventListener("click", function (e) {
  if (window.innerWidth >= 770 || e.target.classList.contains("fas")) return;
  navBar.style.transition = "transform 1s";
  navBar.style.transform = "translateX(100%)";
  navBarShowing = 0;
});

document.addEventListener("scroll", function (e) {
  if (window.innerWidth >= 770) return;
  navBar.style.transition = "transform 1s";
  navBar.style.transform = "translateX(100%)";
  navBarShowing = 0;
});

// NavBar disappears when scrolling down and appears when scrolling up:

window.onscroll = function () {
  if (window.innerWidth >= 770) {
    navBar.style.transform = `translate(0, 0)`;
    return;
  }
  if (pageYOffset < oldPos) {
    navHeight >= 0 ? (navHeight = 0) : (navHeight += 10);
    navBarMobile.style.transform = `translateY(${navHeight}%)`;
    oldPos = pageYOffset;
  }
  if (pageYOffset > oldPos) {
    navHeight <= -100 ? (navHeight = -100) : (navHeight -= 10);
    navBarMobile.style.transform = `translateY(${navHeight}%)`;
    oldPos = pageYOffset;
  }
};

window.addEventListener("resize", function () {
  if (window.innerWidth >= 770) {
    navBar.style.transform = "translate(0,0)";
    cardsFutureDoc.forEach((card) => {
      card.querySelector(".cards-text").style.opacity = "1";
      [...card.querySelector(".cards-text").children].forEach((el) => {
        el.style.transform = "scale(1,1)";
        el.style.transition = "transform 1s";
      });
    });
  }
});

/* -=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */

/* -=-=-=-=-=-=-=-=-=-=-= Future Projects Section =-=-=-=-=-=-=-=-=-=-=- */
cardsFutureDoc.forEach((card) => {
  card.addEventListener("mouseover", function () {
    console.log("in");
    let cardMask = card.querySelector(".cards-text");
    cardMask.style.transition = "transform 2s, opacity 1s";
    cardMask.style.opacity = "1";
    [...cardMask.children].forEach((el) => {
      setTimeout(function () {
        el.style.transform = "scale(1,1)";
        el.style.transition = "transform 1s";
      }, 100);
    });
  });
});

cardsFutureDoc.forEach((card) => {
  card.addEventListener("mouseout", function () {
    console.log("out");
    if (innerWidth > 770) {
      return;
    }
    let cardMask = card.querySelector(".cards-text");
    cardMask.style.transition = "transform 2s, opacity 1s";
    cardMask.style.opacity = "0";
    [...cardMask.children].forEach((el) => {
      setTimeout(function () {
        el.style.transform = "scale(0.5,0.5)";
        el.style.transition = "transform 1s";
      }, 100);
    });
  });
});

/* -=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */

/* -=-=-=-=-=-=-=-=-=-=-= Reset settings when changing view width from mobile to desktop =-=-=-=-=-=-=-=-=-=-=- */
if (window.innerWidth < 770) {
  cardsFutureDoc.forEach((card) => {
    card.querySelector(".cards-text").style.opacity = "0";
    [...card.querySelector(".cards-text").children].forEach((el) => {
      el.style.transform = "scale(0.5,0.5)";
      el.style.transition = "transform 1s";
    });
  });
}

/* -=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */

/* -=-=-=-=-=-=-=-=-=-=-= Lazy Loading =-=-=-=-=-=-=-=-=-=-=- */

const addInterserctionObserver = function () {
  const lazyLoading = function (entries, observer) {
    const [entry] = entries;
    if (entry.isIntersecting && entry.IntersectingRatio !== 1) {
      entry.target.style.transition = "opacity 1s, transform 1s";
      entry.target.classList.remove("section-hidden");
      if (entry.target === aboutUsSection) {
        let time = 0;
        const cards = aboutUsSection.querySelectorAll(".about-us-card");
        cards.forEach((card) => {
          time++;
          setTimeout(function () {
            card.style.transition = "opacity 1s, transform 1s";
            card.classList.remove("section-hidden");
          }, 300 * time);
        });
      }
      if (entry.target === futureFunctionSection) {
        let time = 0;
        const cards = futureFunctionSection.querySelectorAll(".doc-card");
        cards.forEach((card) => {
          time++;
          setTimeout(function () {
            card.style.transition = "opacity 1s, transform 1s";
            card.classList.remove("section-hidden");
          }, 300 * time);
        });
        observer.unobserve(entry.target);
      }
    }
  };

  const options = {
    root: null,
    threshold: 0.15,
  };

  return new IntersectionObserver(lazyLoading, options);
};

const allSections = [
  aboutUsSection,
  hearFromUsSection,
  tryItSection,
  futureFunctionSection,
];

allSections.forEach((sec) => {
  sec.classList.add("section-hidden");
  addInterserctionObserver().observe(sec);
});

/* -=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */

/* -=-=-=-=-=-=-=-=-=-=-= Validatio of the CNPJ and retrieve PDF =-=-=-=-=-=-=-=-=-=-=- */

tryItBtn.addEventListener("click", async (e) => {
  // In case the back-end is retrieving the pdf and the user keeps clicking the button
  if (btnClicked !== 0) {
    document.querySelector(".error-msg").textContent =
      "We are working on it, just few more seconds...";
    return;
  }
  document.querySelector(".loading-img").classList.remove("hidden");
  document.querySelector(".download-form").classList.add("hidden");
  document.querySelector(".error-msg").textContent =
    "It will take few seconds...";
  document.querySelector(".loading-img").style.opacity = "0";

  // ----------------------

  let cnpj = await document
    .querySelector(".cnpj-input")
    .value.replaceAll("/", "");
  if (cnpj === "") {
    document.querySelector(".error-msg").textContent = "Empty entry";
    return;
  }
  btnClicked = 1;
  document.querySelector(".loading-img").style.opacity = "1";
  const msgJSON = await (await fetch(`/cnpjcheck/${cnpj}`)).json();
  console.log("after");
  document.querySelector(".loading-img").style.opacity = "0";
  if (!msgJSON.pdfFile) {
    document.querySelector(".error-msg").textContent = await msgJSON.answerCNPJ;
    btnClicked = 0;
    return;
  }
  const pdfPath = msgJSON.pdfFile;
  document.querySelector(".loading-img").classList.add("hidden");
  document.querySelector(".download-form").classList.remove("hidden");
  btnClicked = 0;
});

/* -=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */

// setTimeout(function () {
//   document.querySelector(".loading-img").style.opacity = "1";
// }, 4000);

// setTimeout(function () {
//   document.querySelector(".loading-img").classList.add("hidden");
//   document.querySelector(".download-form").classList.remove("hidden");
// }, 8000);
