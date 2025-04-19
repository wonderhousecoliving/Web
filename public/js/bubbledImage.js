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

async function createBubbledImage(imageElement) {
    // Obtener el contenedor de la imagen
    const container = imageElement.parentNode;
    
    // Asegurarse de que el contenedor tenga posición relativa
    container.style.position = 'relative';
    
    // Obtener las dimensiones del contenedor
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    imageElement.style.opacity='0.0';

    console.log('Container dimensions:', containerWidth, containerHeight);
    
    // Create PIXI Application with transparent background
    const app = new PIXI.Application({
        width: containerWidth,
        height: containerHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    // Configurar el canvas
    app.view.style.position = 'absolute';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.width = '100%';
    app.view.style.height = '100%';
    app.view.style.zIndex = '1';
    
    // Insertar el canvas después de la imagen
    container.appendChild(app.view);

    // Create texture from the image
    const texture = PIXI.Texture.from(imageElement);
    const sprite = new PIXI.Sprite(texture);
    sprite.width = containerWidth;
    sprite.height = containerHeight;
    app.stage.addChild(sprite);

    try {
        // Load the shader from external file
        const shaderSource = await loadShader('shaders/bubbledImage.frag');

        // Create the shader uniform values
        const uniforms = {
            time: 0.0,
            resolution: [containerWidth, containerHeight],
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

        // Load controls from HTML file
        const controlsResponse = await fetch('controls/bubbledImageControls.html');
        const controlsHTML = await controlsResponse.text();
        
        // Create a temporary container to parse the HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = controlsHTML;
        
        // Get the controls container and append it to the body
        const controlsContainer = tempContainer.querySelector('.controls-container');
        document.body.appendChild(controlsContainer);
        
        // Get the controls elements
        const noiseScaleSlider = document.getElementById('noiseScale');
        const noiseScaleValue = document.getElementById('noiseScaleValue');
        const showNoiseCheckbox = document.getElementById('showNoise');
        
        // Add event listeners
        noiseScaleSlider.addEventListener('input', (e) => {
            uniforms.noiseScale = parseFloat(e.target.value);
            noiseScaleValue.textContent = uniforms.noiseScale;
        });
        
        showNoiseCheckbox.addEventListener('change', (e) => {
            uniforms.showNoise = e.target.checked;
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            const newWidth = imageElement.clientWidth;
            const newHeight = imageElement.clientHeight;
            
            app.renderer.resize(1024, 1024);
            sprite.width = newWidth;
            sprite.height = newHeight;
            uniforms.resolution = [newWidth, newHeight];
        });

    } catch (error) {
        console.error('Error creating shader:', error);
    }

    return app;
}

// Export the function
window.createBubbledImage = createBubbledImage; 