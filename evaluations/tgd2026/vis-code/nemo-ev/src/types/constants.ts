export const EXTENDED_HEIGHT = 217
export const NORMAL_HEIGHT = 15

export const EXTENDED_WIDTH = 374

export const TOP_PADDING = 40

export const HIGHLIGHTING_COLORS = ["#E69F00", "#56B4E9", "#009E73"];
//#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7 #000000

export const greyedButtonStyle = (node: { isGreyed: boolean }) =>
  node.isGreyed
    ? { filter: "grayscale(0.5)" }
    : {};