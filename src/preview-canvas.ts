import {design} from "./config";
// The complete preview lives within the exposed upper third of the A4 card.
export function drawArchivePreview(
  c: CanvasRenderingContext2D,
  index: number,
  title: string,
  subtitle = '',
  cover?: HTMLImageElement,
) {
  const { width: w, height: h } = c.canvas;
  const imageWidth = w * design.previewImageFraction;
  c.clearRect(0, 0, w, h);
  c.fillStyle = design.cardPaper;
  c.fillRect(0, 0, w, h);
  c.fillStyle = design.cardImage;
  c.fillRect(0, 0, imageWidth, h);
  c.save();
  c.beginPath();
  c.rect(0, 0, imageWidth, h);
  c.clip();
  c.strokeStyle = design.cardGrid;
  c.lineWidth = 1;
  for (let x = 24; x < imageWidth; x += 40) {
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
  }
  for (let y = 24; y < h; y += 40) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(imageWidth, y); c.stroke();
  }
  c.strokeStyle = design.cardGraph;
  c.lineWidth = 8;
  c.beginPath();
  for (let n = 0; n <= 120; n++) {
    const x = 24 + n / 120 * (imageWidth - 48);
    const y = h * .5 - h * .2 * Math.sin(n * .045 + index % 9 * .4) * Math.exp(-n * .002);
    if (n) c.lineTo(x, y); else c.moveTo(x, y);
  }
  c.stroke();
  if (cover) {
    const scale = Math.max(imageWidth / cover.naturalWidth, h / cover.naturalHeight);
    const dw=cover.naturalWidth*scale, dh=cover.naturalHeight*scale;
    c.drawImage(cover,(imageWidth-dw)/2,(h-dh)/2,dw,dh);
  }
  c.restore();
  const textX = imageWidth + 32;
  const textWidth = w - textX - 24;
  const fitText = (text: string, size: number, minimum: number, weight: number) => {
    c.font = `${weight} ${size}px ${design.fontFamily}`;
    while (size > minimum && c.measureText(text).width > textWidth) {
      size -= 2; c.font = `${weight} ${size}px ${design.fontFamily}`;
    }
    while (text.length > 1 && c.measureText(text).width > textWidth) text = text.slice(0, -2) + '…';
    return text;
  };
  c.fillStyle = design.cardText;
  c.textBaseline = 'middle';
  const heading = fitText(title, 100, 48, 700);
  c.fillText(heading, textX, h * .39);
  c.fillStyle = design.cardSubtitle;
  const caption = fitText(subtitle, 54, 40, 500);
  c.fillText(caption, textX, h * .66);
  c.fillStyle = design.accent;
  c.fillRect(textX, h * .8, 42, 4);
}
