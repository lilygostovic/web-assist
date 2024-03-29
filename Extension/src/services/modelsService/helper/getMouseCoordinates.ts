export const getMouseCoordinates = (): { mouseX: number; mouseY: number } => {
  let mouseX = 0;
  let mouseY = 0;

  // Add event listener to track mouse movements
  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  return { mouseX, mouseY };
};
