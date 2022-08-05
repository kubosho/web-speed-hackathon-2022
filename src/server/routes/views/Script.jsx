import React from "react";

export const Script = () => (
  <>
    <link as="script" href="/framework.js" rel="preload" />
    <link as="script" href="/vendor.js" rel="preload" />
    <link as="script" href="/main.js" rel="preload" />
    <script defer src="/framework.js" />
    <script defer src="/vendor.js" />
    <script defer src="/main.js" />
  </>
);
