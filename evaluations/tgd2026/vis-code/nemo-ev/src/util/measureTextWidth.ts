export function measureTextWidth(text: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = "bold 16px Arial, Helvetica, sans-serif";
  return context.measureText(text).width + 10; //small padding
}
