document.addEventListener('DOMContentLoaded', () => {
    // Find all images with BubbleFx attribute
    const images = document.querySelectorAll('img[BubbleFx]');
    
    // Process each image
    images.forEach(image => {
        // Get padding values from attributes or use defaults
        const paddingHorizontal = parseInt(image.getAttribute('paddingHorizontal')) || 0;
        const paddingVertical = parseInt(image.getAttribute('paddingVertical')) || 0;
        
        // Apply the bubble effect
        if (image.complete) {
            createBubbledImage(image, paddingHorizontal, paddingVertical);
        } else {
            image.onload = () => createBubbledImage(image, paddingHorizontal, paddingVertical);
        }
    });
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
async function createBubbledImage(imageElement, paddingHorizontalPercent, paddingVerticalPercent) {
  
    // Obtener el contenedor de la imagen
    const container = imageElement.parentNode;
    
    // Asegurarse de que el contenedor tenga posición relativa
    container.style.position = 'relative';
    
    // Obtener las dimensiones del contenedor
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    imageElement.style.opacity='0.0';

    // Calcular el padding en píxeles basado en porcentajes
    const paddingHorizontal = (containerWidth * paddingHorizontalPercent) / 100;
    const paddingVertical = (containerHeight * paddingVerticalPercent) / 100;

    // Create PIXI Application with transparent background
    let appWidth = (imageElement.clientWidth*window.devicePixelRatio)+paddingHorizontal;
    let appHeight = (imageElement.clientHeight*window.devicePixelRatio)+paddingVertical;
    console.log("appWidth,appHeight",imageElement.naturalWidth,imageElement.naturalHeight);
    const app = new PIXI.Application({
        width:appWidth,
        height: appHeight,
        resolution: 1/window.devicePixelRatio, 
        backgroundAlpha: 0,
        autoDensity: false,
    });
  
    // Configurar el canvas
    app.view.style.position = 'absolute';
    app.view.style.top = (-paddingVertical/2)+'px';
    app.view.style.left = (-paddingHorizontal/2)+'px';
    app.view.style.aspectRatio='unset';
    // app.view.style.width = (containerWidth+100)+'px';
    // app.view.style.height = (containerHeight+100)+'px';
    // app.view.style.zIndex = '1';
  // app.view.style.backgroundColor='rgba(0,0,0,0.5)';
    
    // Insertar el canvas después de la imagen
    container.appendChild(app.view);

    let rectWidth = app.width;
    let rectHeight = app.height;
    // Cargar la imagen como textura
    const texture = PIXI.Texture.from(imageElement);
  
    const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', [
      0, 0,
      rectWidth, 0,
      rectWidth, rectHeight,
      0, rectHeight
    ], 2)
    .addAttribute('aUV', [
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ], 2)
    .addIndex([0, 1, 2, 0, 2, 3]);

    const vertexSrc = `
    precision mediump float;
    attribute vec2 aVertexPosition;
    attribute vec2 aUV;
  
    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
  
    varying vec2 vUV;
  
    void main() {
      vUV = aUV;
      gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
  `;
  


    try {
        // Load the shader from external file
        const shaderSource3D = await loadShader('shaders/bubbledImage3D.frag');
        // Create the shader uniform values
        const uniforms = {
            time: 0.0,
            resolutionX: appWidth,
            resolutionY: appHeight,
            imageResolutionX: imageElement.naturalWidth,
            imageResolutionY: imageElement.naturalHeight,
            noiseScale: 0.5,
            showNoise: false,
            uSampler: texture
        };

        // Create and apply the shader
      


      const shader3D = PIXI.Shader.from(vertexSrc, shaderSource3D,uniforms);
  const mesh = new PIXI.Mesh(geometry, shader3D);
  app.stage.addChild(mesh);
       // sprite.filterArea = new PIXI.Rectangle(0, 0, sprite.width, sprite.height);

        // Animation loop
        app.ticker.add((delta) => {
            uniforms.time += delta * 0.02;
        });


        // Función para actualizar el tamaño del sprite
        function updateSpriteSize(width, height) {
            rectWidth = width;
            rectHeight = height;
            const newVertices = [
                0, 0,
                width, 0,
                width, height,
                0, height
              ];
              
              geometry.getBuffer('aVertexPosition').update(new Float32Array(newVertices));
        }

      
        updateSpriteSize(parseInt(appWidth), parseInt(appHeight));

        function resizeApp() {
            // Recalcular el padding basado en el nuevo tamaño del contenedor
            const newPaddingHorizontal = (imageElement.clientWidth * paddingHorizontalPercent) / 100;
            const newPaddingVertical = (imageElement.clientHeight * paddingVerticalPercent) / 100;
            
            app.width = (imageElement.clientWidth * window.devicePixelRatio) + newPaddingHorizontal;
            app.height = (imageElement.clientHeight * window.devicePixelRatio) + newPaddingVertical;
            
            app.view.style.top = (-newPaddingVertical/2)+'px';
            app.view.style.left = (-newPaddingHorizontal/2)+'px';
            
            updateSpriteSize(app.width, app.height);
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