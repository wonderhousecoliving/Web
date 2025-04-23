document.addEventListener('DOMContentLoaded', () => {
    const landingBackground = document.querySelector('#landingBackground');
    if (landingBackground) {
        createLandingBackground(landingBackground);
    }
});

async function createLandingBackground(container) {
    let appWidth = (container.clientWidth*window.devicePixelRatio);
    let appHeight = (container.clientHeight*window.devicePixelRatio);
   
    // Create PIXI Application with transparent background
    const app = new PIXI.Application({
        width: appWidth,
        height: appHeight,
        backgroundAlpha: 0,
        resolution: 1/window.devicePixelRatio, 
        autoDensity: false,
       
    });

    // Configure canvas
    app.view.style.position = 'absolute';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.zIndex = '1';
    app.view.style.aspectRatio = 'unset !important';

    let rectWidth = appWidth;
    let rectHeight = appHeight;
   
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



  ////////////////////////////////////////////////////////////////
    // Insert canvas into container
    container.appendChild(app.view);

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

    

    // Function to update video frame
    function updateVideoFrame() {
        if (video.readyState >= 2) {
            videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
            videoTexture.update();
        }
    }

    // Single event handler for video ready
    video.addEventListener('canplay', () => {
       
    }, { once: true });

    // Start video playback
    video.play().catch(error => {
        console.error('Error playing video:', error);
    });

    try {
        // Load the shader
        const shaderSource3D = await loadShader('shaders/landingBackgroundShader.frag');
    const uniforms = {
      time: 0.0,
      resolutionX: appWidth,
      resolutionY: appHeight,
      imageResolutionX: 1920,
      imageResolutionY: 1080,
      uSampler: videoTexture,
  };
  
    const shader3D = PIXI.Shader.from(vertexSrc, shaderSource3D,uniforms);
    const mesh = new PIXI.Mesh(geometry, shader3D);
    app.stage.addChild(mesh);

        

        // Animation loop
        app.ticker.add((delta) => {
            uniforms.time += delta * 0.005;
            updateVideoFrame();
        });

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
        // Handle window resize
        function resizeApp() {
             appWidth = (container.clientWidth*window.devicePixelRatio);
             appHeight = (container.clientHeight*window.devicePixelRatio);
           
            app.renderer.resize(appWidth, appHeight);
            updateSpriteSize(appWidth, appHeight);
            // Update canvas size
            videoCanvas.width = appWidth;
            videoCanvas.height = appHeight;
            
            uniforms.resolutionX = appWidth;
            uniforms.resolutionY = appHeight;
            uniforms.imageResolutionX = 1920;
            uniforms.imageResolutionY = 1080;
            console.log("OnResize container size->",uniforms.resolutionX,uniforms.resolutionY);
            console.log("OnResize image size->",uniforms.imageResolutionX,uniforms.imageResolutionY);
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