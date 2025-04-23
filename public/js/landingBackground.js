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

    // Create container for the video and background
    const videoContainer = new PIXI.Container();
    app.stage.addChild(videoContainer);

    // Load background image first
    const bgTexture = await PIXI.Texture.from('imgs/WonderPicture0.png');
    const bgSprite = new PIXI.Sprite(bgTexture);
    
    // Center and scale background
    bgSprite.anchor.set(0.5);
    bgSprite.scale.set(Math.min(
        app.screen.width / bgSprite.width,
        app.screen.height / bgSprite.height
    ));
    videoContainer.addChild(bgSprite);

    // Create video element
    const video = document.createElement('video');
    video.src = 'imgs/LandingVideo.mp4';
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';

    // Create canvas for video
    const videoCanvas = document.createElement('canvas');
    const videoCtx = videoCanvas.getContext('2d');
    
    // Set canvas size
    videoCanvas.width = container.clientWidth;
    videoCanvas.height = container.clientHeight;

    // Create texture from canvas
    const videoTexture = PIXI.Texture.from(videoCanvas);
    const videoSprite = new PIXI.Sprite(videoTexture);

    // Center the video sprite
    videoSprite.anchor.set(0.5);
    videoSprite.scale.set(Math.min(
        app.screen.width / videoSprite.width,
        app.screen.height / videoSprite.height
    ));

    // Hide video initially
    videoSprite.visible = false;
    videoContainer.addChild(videoSprite);

    // Function to update video frame
    function updateVideoFrame() {
        if (video.readyState >= 2) {
            videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
            videoTexture.update();
        }
    }

    // Single event handler for video ready
    video.addEventListener('canplay', () => {
        videoSprite.visible = true;
        bgSprite.visible = false;
    }, { once: true });

    // Start video playback
    video.play().catch(error => {
        console.error('Error playing video:', error);
    });

    try {
        // Load the shader
        const shaderSource = await loadShader('shaders/bubbleMaskGradient.frag');

        // Create shader uniforms
        const uniforms = {
            time: 0.0,
            resolutionX: container.clientWidth,
            resolutionY: container.clientHeight,
            noiseScale: 0.9,
            showNoise: true
        };

        // Create and apply the shader to both sprites
        const shader = new PIXI.Filter(undefined, shaderSource, uniforms);
        videoSprite.filters = [shader];
        bgSprite.filters = [shader];

        // Animation loop
        app.ticker.add((delta) => {
            uniforms.time += delta * 0.005;
            updateVideoFrame();
        });

        // Handle window resize
        function resizeApp() {
            app.renderer.resize(Math.max(app.screen.width, 920), container.clientHeight);
            videoContainer.x = app.screen.width / 2;
            videoContainer.y = app.screen.height / 2;
            
            // Update canvas size
            videoCanvas.width = container.clientWidth;
            videoCanvas.height = container.clientHeight;
            
            // Update sprites scale to maintain aspect ratio
            const scale = Math.min(
                app.screen.width / videoSprite.width,
                app.screen.height / videoSprite.height
            );
            videoSprite.scale.set(scale);
            bgSprite.scale.set(scale);
            
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