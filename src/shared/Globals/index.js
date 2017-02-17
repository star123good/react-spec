import styled, { css } from 'styled-components';

export const Gradient = (g1, g2) => {
  return css`radial-gradient(ellipse farthest-corner at top left, ${g1} 0%, ${g2} 100%)`;
};

export const Shadow = {
  low: '0 4px 8px -2px rgba(23,26,33, 0.15)',
  mid: '0 8px 16px -4px rgba(23,26,33, 0.2)',
  high: '0 16px 32px -8px rgba(23,26,33, 0.25)',
  input: 'inset 0 3px 5px rgba(23,26,33, 0.05), inset 0 0 1px rgba(23,26,33, 0.1)',
  border: '0 0 1px rgba(23,26,33, 0.3)',
};

export const fontStack = css`
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica', 'Segoe', sans-serif
`;

export const H1 = styled.h1`
	${fontStack};
	color: ${({ theme }) => theme.text.default};
	font-weight: 700;
	font-size: 32px;
	line-height: 40px;
	margin: 0;
	padding: 0;
`;

export const H2 = styled.h2`
	color: ${({ theme }) => theme.text.default};
	${fontStack};
	font-weight: 500;
	font-size: 24px;
	line-height: 32px;
	margin: 0;
	padding: 0;
`;

export const H3 = styled.h3`
	color: ${({ theme }) => theme.text.default};
	${fontStack};
	font-weight: 500;
	font-size: 16px;
	line-height: 24px;
	margin: 0;
	padding: 0;
`;

export const H4 = styled.h4`
	color: ${({ theme }) => theme.text.default};
	${fontStack};
	font-weight: 500;
	font-size: 14px;
	line-height: 20px;
	margin: 0;
	padding: 0;
`;

export const H5 = styled.h5`
	color: ${({ theme }) => theme.text.default};
	${fontStack};
	font-weight: 500;
	font-size: 12px;
	line-height: 16px;
	margin: 0;
	padding: 0;
`;

export const H6 = styled.h6`
	color: ${({ theme }) => theme.text.default};
	${fontStack};
	font-weight: 600;
	text-transform: uppercase;
	font-size: 10px;
	line-height: 12px;
	margin: 0;
	padding: 0;
`;

export const P = styled.p`
	color: ${({ theme }) => theme.text.default};
	${fontStack};
	font-weight: 400;
	font-size: 14px;
	line-height: 20px;
	margin: 0;
	padding: 0;
`;

export const Span = styled.span`
	color: ${({ theme }) => theme.text.default};
	${fontStack};
	font-weight: 400;
	font-size: 14px;
	line-height: 20px;
	margin: 0;
	padding: 0;
`;

export const Tooltip = props => css`
	position: relative;

	&:after,
	&:before {
		line-height: 1;
    user-select: none;
    pointer-events: none;
    position: absolute;
    opacity: 0;
    display: block;
	}

	&:before {
		content: '';
    z-index: 1001;
    border: 5px solid transparent;

    ${props.tipLocation === 'top'
  ? css`
			bottom: 100%;
			left: 33%;
	    border-bottom-width: 0;
	    border-top-color: ${({ theme }) => theme.bg.reverse};
	    `
  : ''}

	  ${props.tipLocation === 'right'
  ? css`
			top: 50%;
	    border-left-width: 0;
	    border-right-color: ${({ theme }) => theme.bg.reverse};
	    right: calc(0em - 5px);
	    transform: translate(.5em, -50%);
			`
  : ''}

		${props.tipLocation === 'bottom'
  ? css`
			top: 100%;
			left: 33%;
	    border-top-width: 0;
	    border-bottom-color: ${({ theme }) => theme.bg.reverse};
			`
  : ''}

		${props.tipLocation === 'left'
  ? css`	top: 50%;
	    border-right-width: 0;
	    border-left-color: ${({ theme }) => theme.bg.reverse};
	    left: calc(0em - 6px);
	    transform: translate( -6px, -50%);`
  : ''}

	  ${!props.tipLocation
  ? css`
			bottom: 100%;
	    border-bottom-width: 0;
	    border-top-color: ${({ theme }) => theme.bg.reverse};
	    `
  : ''}
	}

	&:after {
		content: ${props.tipText ? `'${props.tipText}'` : `''`};
    z-index: 1000;
    ${fontStack};
    font-size: 14px;
    font-weight: 500;
		min-width: 3em;
    max-width: 21em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: ${Shadow.mid};
    background: ${({ theme }) => theme.bg.reverse};
    color: ${({ theme }) => theme.text.reverse};

    ${props.tipLocation === 'top'
  ? css`
			bottom: calc(100% + 5px);
			left: -100%;
	    `
  : ''}

	  ${props.tipLocation === 'right'
  ? css`
			top: 50%;
	    left: calc(100% + 5px);
	    transform: translate(.5em, -50%);
			`
  : ''}

		${props.tipLocation === 'bottom'
  ? css`
			top: calc(100% + 5px);
			left: -175%;
			`
  : ''}

		${props.tipLocation === 'left'
  ? css`
			top: 50%;
	    right: calc(100% + 5px);
	    transform: translate(-.5em, -50%);
			`
  : ''}

		${!props.tipLocation
  ? css`
			bottom: calc(100% + 5px);
	    `
  : ''}
	}

	&:hover:after,
	&:hover:before {
		opacity: 1;
		transition: all 0.2s ease-in 0.2s;
`;
