document.addEventListener('DOMContentLoaded', () => {

    const svgObject = document.getElementById('logo-svg');
    new Vivus('logo-svg', {
        type: 'delayed',
        duration: 500,
        animTimingFunction: Vivus.EASE
      });
   
}); 