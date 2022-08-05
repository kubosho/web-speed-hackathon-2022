import React from "react";
import styled from "styled-components";

const Image = styled.img`
  display: block;
  margin: 0 auto;
`;

/**
 * @typedef Props
 * @type {object}
 * @property {string} alt
 * @property {string} src
 * @property {number} width
 * @property {nubmer} height
 */

/** @type {React.VFC<Props>} */
export const HeroImage = ({ alt, height, src, width }) => {
  return <Image alt={alt} height={height} src={src} width={width} />;
};
