document.addEventListener('DOMContentLoaded', () => {
    const landingBackground = document.querySelector('#landingBackground');
    if (landingBackground) {
        createLandingBackground(landingBackground);
    }
});

async function createLandingBackground(container) {
    // Create PIXI Application with transparent background
    const app = new PIXI.Application({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundAlpha: 0,
        backgroundColor: 0xFF0000 // Color rojo temporal para debug
    });

    // Configure canvas
    app.view.style.position = 'absolute';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.width = '100%';
    app.view.style.height = '100%';
    app.view.style.zIndex = '1';

    // Insert canvas into container
    container.appendChild(app.view);

    // Create container for the image
    const imgContainer = new PIXI.Container();
    app.stage.addChild(imgContainer);

    // Load the background image
    const texture = await PIXI.Texture.from('imgs/WonderPicture0.png');
    const sprite = new PIXI.Sprite(texture);

    // Centrar el sprite
    sprite.anchor.set(0.5);
    imgContainer.x = app.screen.width / 2;
    imgContainer.y = app.screen.height / 2;

    // Set sprite size to match container while maintaining aspect ratio
    const scale = Math.min(
        app.screen.width / texture.width,
        app.screen.height / texture.height
    );
    sprite.scale.set(scale);

    imgContainer.addChild(sprite);


    try {
        // Load the shader
        const shaderSource = await loadShader('shaders/bubbleMaskGradient.frag');

        // Create shader uniforms
        const uniforms = {
            time: 0.0,
            resolutionX: container.clientWidth,
            resolutionY: container.clientHeight,
            noiseScale: 0.7,
            showNoise: true
        };

        // Create and apply the shader
        const shader = new PIXI.Filter(undefined, shaderSource, uniforms);
        sprite.filters = [shader];

        // Animation loop
        app.ticker.add((delta) => {
            uniforms.time += delta * 0.005;
        });

        // Handle window resize
        function resizeApp() {
          //  app.renderer.resize(Math.max(app.screen.width, 1920), container.clientHeight);
            app.renderer.resize(container.clientWidth, container.clientHeight);
             imgContainer.x = app.screen.width / 2;
             imgContainer.y = app.screen.height / 2;
            const scale = Math.min(
                app.screen.width / texture.width,
                app.screen.height / texture.height
            );
             sprite.scale.set(scale);
             uniforms.resolutionX = container.clientWidth;
             uniforms.resolutionY = container.clientHeight;
        }

        window.addEventListener('resize', resizeApp);
        resizeApp();

    } catch (error) {
        console.error('Error creating shader:', error);
    }

    return app;
}

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