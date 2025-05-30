document.addEventListener('DOMContentLoaded', () => {
    initMenuBackground();
});

function initMenuBackground() {
    const menu = document.querySelector('.menu');
    if (!menu) return;

    // Remove existing background
    menu.style.backgroundImage = 'none';

    // Create PIXI Application with transparent background
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: 150, // Menu height
        backgroundAlpha: 0, // Transparent background
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    // Add the canvas to the menu
    app.view.style.position = 'absolute';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.zIndex = '-1';
    menu.insertBefore(app.view, menu.firstChild);

    // Perlin noise shader fragment
    const perlinNoiseShader = `
    precision mediump float;
    
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 brightColor;
    
    // Classic Perlin 3D Noise by Stefan Gustavson
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
    
    float cnoise(vec3 P) {
        vec3 Pi0 = floor(P); // Integer part
        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        Pi0 = mod(Pi0, 289.0);
        Pi1 = mod(Pi1, 289.0);
        vec3 Pf0 = fract(P); // Fractional part
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;
    
        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);
    
        vec4 gx0 = ixy0 / 7.0;
        vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
        vec4 gx1 = ixy1 / 7.0;
        vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;
    
        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);
    
        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
    }
    
    void main() {
        vec2 uv = vTextureCoord;
        
        // Create noise at different scales and movement speeds
        float scale1 = 0.7; // Larger scale for main noise pattern
        float scale2 = 1.5; // Smaller scale for detail
        
        // Adjust X scale to be wider
        vec2 scale1XY = vec2(scale1 * 9.0, scale1);
        vec2 scale2XY = vec2(scale2 * 9.0, scale2);
        
        // Get noise value at different scales with adjusted X scale
        float noiseVal1 = cnoise(vec3(uv * scale1XY, time * 0.4)) * 0.6;
        float noiseVal2 = cnoise(vec3(uv * scale2XY, time * 0.15)) * 0.4;
        
        // Combine noise values
        float combinedNoise = (noiseVal1 + noiseVal2) * 0.6 + 0.4;
        
        // Create gradient
        float gradient = 1.0 - uv.y;
        gradient *= pow(gradient, 2.0);
        
        // Adjust noise to make it more contrasted and keep desired values in 0-1 range
        combinedNoise += gradient;
        combinedNoise *= gradient;
        combinedNoise = smoothstep(0.15, 0.152, combinedNoise);
        
        // Create a solid background with the bright color
        vec4 backgroundColor = vec4(brightColor, 1.0);
        
        // Mix between transparent and background color based on noise
        gl_FragColor = mix(vec4(0.0), backgroundColor, combinedNoise);
    }
    `;

    // Create a full-screen sprite to apply the shader to
    const quad = new PIXI.Sprite(PIXI.Texture.WHITE);
    quad.width = app.screen.width;
    quad.height = app.screen.height;
    app.stage.addChild(quad);

    // Create the shader uniform values
    const uniforms = {
        time: 0.0,
        resolution: [app.screen.width, app.screen.height],
        brightColor: [0.922, 0.914, 0.875] // --bright: #EBE9DF in normalized RGB
    };

    // Create and apply the shader
    const shader = new PIXI.Filter(undefined, perlinNoiseShader, uniforms);
    quad.filters = [shader];

    // Animation loop
    app.ticker.add((delta) => {
        uniforms.time += delta * 0.01; // Slow, subtle movement
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        app.renderer.resize(Math.max(app.screen.width, 1920), 150);
        quad.width = app.screen.width;
        uniforms.resolution = [app.screen.width, app.screen.height];
    });
} 