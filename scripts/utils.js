let button = null;
let style = null;

export function addCustomButton(site, link, styles = {}) {
    button = document.createElement("button");
    button.setAttribute("type", "button");
  
    Object.assign(button.style, {
      backgroundColor: site === "anilist" ? "#19212d" : "#2e51a2",
      color: "#ffffff",
      width: "50px",
      height: "50px",
      borderRadius: "8px",
      fontSize: "14px",
      border: "none",
      cursor: "pointer",
      position: "fixed",
      bottom: "20px",
      left: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      animation: "buttonAnimation 2s ease infinite",
      overflow: "hidden",
      ...styles,
    });

    document.body.appendChild(button);
  
    if (site === "myanimelist") {
      button.innerHTML = `<img src='https://myanimelist.net/img/common/pwa/launcher-icon-3x.png' style="width:100%;height:100%;" alt='AniList' />`;
    } else if (site === "anilist") {
      button.innerHTML = `<img src='https://anilist.co/img/icons/icon.svg' style="width:100%;height:100%;" alt='AniList' />`;
    }
  
    button.addEventListener("click", function () {
      window.location.href = link;
    });
  }

  export function injectCSSAnimation(animationCSS) {
    style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(animationCSS));
  
    document.head.appendChild(style);
  }
  
  const listAnimations = [
    `@keyframes buttonAnimation {
      0% {
        transform: scale(1);
      }
    
      50% {
        transform: scale(1.1);
      }
    
      100% {
        transform: scale(1);
      }
    }`,
    `@keyframes buttonAnimation {
      0% {
        animation-timing-function: ease-in;
        opacity: 0;
        transform: translateY(-45px);
      }
    
      16% {
        opacity: .4;
      }
    
      24% {
        opacity: 1;
      }
    
      40% {
        animation-timing-function: ease-in;
        transform: translateY(-24px);
      }
    
      65% {
        animation-timing-function: ease-in;
        transform: translateY(-12px);
      }
    
      82% {
        animation-timing-function: ease-in;
        transform: translateY(-6px);
      }
    
      93% {
        animation-timing-function: ease-in;
        transform: translateY(-4px);
      }
    
      25%,
      55%,
      75%,
      87% {
        animation-timing-function: ease-out;
        transform: translateY(0px);
      }
    
      100% {
        animation-timing-function: ease-out;
        opacity: 1;
        transform: translateY(0px);
      }
    }`,
    `@keyframes buttonAnimation {
      0%,
      100% {
        transform: rotate(0deg);
        transform-origin: 50% 50%;
      }
    
      10% {
        transform: rotate(8deg);
      }
    
      20%,
      40%,
      60% {
        transform: rotate(-10deg);
      }
    
      30%,
      50%,
      70% {
        transform: rotate(10deg);
      }
    
      80% {
        transform: rotate(-8deg);
      }
    
      90% {
        transform: rotate(8deg);
      }
    }`
  ]
  
  export const animationCSS = () => listAnimations[Math.floor(Math.random() * listAnimations.length)];