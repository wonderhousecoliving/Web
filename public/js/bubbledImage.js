document.addEventListener('DOMContentLoaded', () => {
   

    const image = document.querySelector('#wonderHouseImage1');
    if (image) {
        // Esperar a que la imagen cargue
        if (image.complete) {
            createBubbledImage(image);
        } else {
            image.onload = () => createBubbledImage(image);
        }
    }
});

async function loadShader(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading shader:', error);
        throw error;
    }
}
// points: array of points with x,y,radius
async function createBubbledImage(imageElement,shapingPoints) {
    // Obtener el contenedor de la imagen
    const container = imageElement.parentNode;
    
    // Asegurarse de que el contenedor tenga posición relativa
    container.style.position = 'relative';
    
    // Obtener las dimensiones del contenedor
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    imageElement.style.opacity='0.0';

    
    // Create PIXI Application with transparent background
    const app = new PIXI.Application({
      
        width:container.clientWidth*window.devicePixelRatio,
        height: container.clientHeight*window.devicePixelRatio,
        resolution: 1/window.devicePixelRatio, 
        backgroundAlpha: 0,
       // resizeTo: container,
        autoDensity: false
    });

    // Configurar el canvas
    app.view.style.position = 'absolute';
    app.view.style.top = '0px';
    app.view.style.left = '0px';
   
   // app.view.style.width = (containerWidth+100)+'px';
   // app.view.style.height = (containerHeight+100)+'px';
   // app.view.style.zIndex = '1';
   // app.view.style.backgroundColor='rgba(0,0,0,0.5)';
    
    // Insertar el canvas después de la imagen
    container.appendChild(app.view);

    const imgContainer = new PIXI.Container();
    app.stage.addChild(imgContainer);

    const texture = PIXI.Texture.from(imageElement);
    const sprite = new PIXI.Sprite(texture);
    
    // Mantener el tamaño original del sprite
    sprite.width =imageElement.clientWidth*window.devicePixelRatio;
    sprite.height = imageElement.clientHeight*window.devicePixelRatio;
    
    // Desactivar el escalado automático
    sprite.autoResize = false;

    imgContainer.addChild(sprite);
    imgContainer.x = 10;
    imgContainer.y = 10;




    try {
        // Load the shader from external file
        const shaderSource = await loadShader('shaders/bubbledImage.frag');

        // Create the shader uniform values
        const uniforms = {
            time: 0.0,
            resolutionX: 256.0,
            resolutionY: 256.0,
            imageResolutionX: imageElement.naturalWidth,
            imageResolutionY: imageElement.naturalHeight,
            noiseScale: 0.5,
            showNoise: false
        };


        // Create and apply the shader
        const shader = new PIXI.Filter(undefined, shaderSource, uniforms);
        sprite.filters = [shader];

        // Animation loop
        app.ticker.add((delta) => {
            uniforms.time += delta * 0.01;
        });

       
        function resizeApp() {
            app.width= container.clientWidth*window.devicePixelRatio;
            app.height= container.clientHeight*window.devicePixelRatio;
            
            // Solo actualizar el tamaño del canvas, no el contenido
          //  app.view.style.width = (containerWidth-500)+'px';
          //  app.view.style.height = (containerHeight-100)+'px';
        }
        //resizeApp();
        // Handle window resize
        window.addEventListener('resize', resizeApp
        );

    } catch (error) {
        console.error('Error creating shader:', error);
    }

    return app;
}

// Export the function
window.createBubbledImage = createBubbledImage; 