document.addEventListener('DOMContentLoaded', () => {
    // Logo animation with Vivus
    const svgObject = document.getElementById('logo-svg');
    new Vivus('logo-svg', {
        type: 'delayed',
        duration: 500,
        animTimingFunction: Vivus.EASE
    });
    
    // Animate menu bubbles SVG
   // animateMenuBackground();
});

function animateMenuBackground() {
    // Get the menu element
    const menu = document.querySelector('.menu');
    
    // Create an SVG element to replace the background image
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svgContainer = document.createElementNS(svgNamespace, 'svg');
    svgContainer.setAttribute('width', '100vw');
    svgContainer.setAttribute('height', '100%');
   // svgContainer.setAttribute('viewBox', '0 0 1992 226');
    svgContainer.setAttribute('fill', 'none');
    svgContainer.setAttribute('preserveAspectRatio', 'none');
    svgContainer.style.position = 'absolute';
    svgContainer.style.top = '0';
    svgContainer.style.left = '0';
    svgContainer.style.zIndex = '-1';


    const defs = document.createElementNS(svgNamespace, "defs");
const pattern = document.createElementNS(svgNamespace, "pattern");
pattern.setAttribute("id", "imagePattern");
pattern.setAttribute("patternUnits", "userSpaceOnUse");
pattern.setAttribute("width", "256");
pattern.setAttribute("height", "256");

const image = document.createElementNS(svgNamespace, "image");
image.setAttribute("href", "imgs/PaperTextureBright.png");
image.setAttribute("x", "0");
image.setAttribute("y", "0");
image.setAttribute("width", "256");
image.setAttribute("height", "256");
    
    // Create the path element based on the original SVG
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0 0 H220 V110');
    //path.setAttribute('fill', '#EBE9DF');
    path.setAttribute("fill", "url(#imagePattern)");
    path.id = 'wavyRect';
    
    svgContainer.appendChild(defs);
    svgContainer.appendChild(pattern);
    pattern.appendChild(image);
    svgContainer.appendChild(path);

    menu.insertBefore(svgContainer, menu.firstChild);
    
    // Remove the background image since we're replacing it with the SVG
    menu.style.backgroundImage = 'none';
    
   
    // Animate the path
    animatePath(path);
}


function animatePath(pathElement) {
    const width = window.innerWidth;
      const height = 50;
      const baseY = 110;
      const numWaves = 3;
      const waveLength = width / numWaves;
      let t = 0;
      function updateWave() {
        let d = `M0 0 H${width} V${baseY} `;
       ////
       for (let i = numWaves; i > 0; i--) {
       
        const x2 = (i - 1) * waveLength;
        const x1 = x2 + waveLength / 2;
        const cp1x = x1 + waveLength / 4;
        const cp1y = baseY + Math.sin(t + i) * height;
        const cp2x = (x1 - waveLength / 4);
        const cp2y = baseY - Math.sin(t + i) * height;
        d += `C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${baseY} `;
      }
    ////
        d += "Z";
        pathElement.setAttribute("d", d);
        t += 0.04;
        requestAnimationFrame(updateWave);
      }

      updateWave();
  
} 