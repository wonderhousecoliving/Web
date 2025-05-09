

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float time;
uniform float resolutionX;
uniform float resolutionY;
uniform float imageResolutionX;
uniform float imageResolutionY;
uniform float noiseScale;
bool showNoise=true;

// Classic Perlin 3D Noise by Stefan Gustavson
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
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

float sdBox(vec2 p, vec2 size) {
    vec2 d = abs(p) - size;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdCircle(vec2 uv, vec2 center, float radius) {
     float d = length(uv - center);
    return clamp(exp(-pow(d / radius, 2.0)),0.0,1.0);
  
}

float intensity(float d, float radius, float softness) {
    return smoothstep(radius, radius - softness, d);
}

void main() {
    // Calcular la relación de aspecto de la imagen
    float aspectRatio =resolutionY / resolutionX;
    float imageAspectRatio = imageResolutionY / imageResolutionX;
    vec2 imageAspect = vec2(1.0, aspectRatio);
    
   
    // Ajustar las coordenadas UV para mantener la relación de aspecto
    vec2 uv = vTextureCoord;
    vec2 adjustedUV = uv * imageAspect;
    adjustedUV = vec2(adjustedUV.x,adjustedUV.y);
    
    // Create noise at different scales and movement speeds
    float scale1 = 7.5 * noiseScale; // Larger scale for main noise pattern
    float scale2 = 10.0 * noiseScale; // Smaller scale for detail
    
    // Adjust X scale to be wider
    vec2 scale1XY = vec2(scale1, scale1);
    vec2 scale2XY = vec2(scale2, scale2);
    
    // Get noise value at different scales with adjusted X scale
    float noiseVal1 = cnoise(vec3(adjustedUV * scale1XY, time * 0.4)) * 0.6;
    float noiseVal2 = cnoise(vec3(adjustedUV * scale2XY, time * 0.15)) * 0.4;
    
    // Combine noise values
    float combinedNoise = (noiseVal1 + noiseVal2) * 0.6 + 0.4;
    
    // Radio en coordenadas UV
    float d =sdCircle(adjustedUV, vec2(0.5, 0.5), 0.15);
    float d2= sdCircle(adjustedUV, vec2(0.45, 0.3), 0.15);
    float d3= sdCircle(adjustedUV, vec2(0.3, 0.7), 0.2);

    float finalUnion = clamp(d + d2+d3, 0.0, 1.0); 
   //  d += sdCircle(adjustedUV, vec2(0.0, 0.0), 0.2);
    float edge = 0.6;             // Controla la suavidad del borde
    float circle =finalUnion;// smoothstep(0.55, edge, finalUnion); 
    
    // Adjust noise to make it more contrasted and keep desired values in 0-1 range
  //  if(!showNoise){
        combinedNoise *= circle;
        combinedNoise += circle/5.0;
        combinedNoise = smoothstep(0.15, 0.152, combinedNoise);
  //  }
    
    // Sample the original image
       imageAspect = vec2(1.0, imageAspectRatio);
     adjustedUV = uv * imageAspect;
    vec4 imageColor = texture2D(uSampler, adjustedUV);
    
    // Mix between transparent and image color based on noise
    if(showNoise){
        // Visualización de las coordenadas UV
        vec3 debugColor = vec3(
            finalUnion,                    // Rojo: círculo
            combinedNoise,                    // Verde: círculo
            combinedNoise              // Azul: ruido
        );
        gl_FragColor = vec4(debugColor, 1.0);
    } else {
        gl_FragColor = mix(vec4(0.0), imageColor, combinedNoise);
    }
} 