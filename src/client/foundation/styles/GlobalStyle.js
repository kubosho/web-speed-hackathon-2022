import { createGlobalStyle } from "styled-components";

import { Color } from "./variables";

export const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box}body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}ul[role="list"],ol[role="list"]{list-style:none}html:focus-within{scroll-behavior:smooth}body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5}a:not([class]){text-decoration-skip-ink:auto}img,picture{max-width:100%;display:block}input,button,textarea,select{font:inherit}@media(prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}

  body {
    color: ${Color.mono[900]};
    background: ${Color.mono[100]};
    font-family: sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul, ol {
    padding: 0;
    list-style: none;
    margin: 0;
  }

  @font-face {
    font-family: "Senobi-Gothic";
    font-weight: normal;
    font-display: fallback;
    src: url("/assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Regular.ttf") format("truetype");
  }

  @font-face {
    font-family: "Senobi-Gothic";
    font-weight: bold;
    font-display: fallback;
    src: url("/assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Bold.ttf") format("truetype");
  }
`;
