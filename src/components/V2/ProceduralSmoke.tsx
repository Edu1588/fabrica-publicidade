import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    
    varying vec2 vUv;

    // Simplex Noise 3D (Ashima Arts)
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                  
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 x) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100.0);
        for (int i = 0; i < 6; ++i) {
            v += a * snoise(x);
            x = x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = vUv - 0.5;
        uv.x *= uResolution.x / uResolution.y;
        
        vec2 originalUv = uv;

        vec2 mouseUv = uMouse - 0.5;
        mouseUv.x *= uResolution.x / uResolution.y;
        
        vec2 delta = uv - mouseUv;
        float dist = length(delta);
        float force = smoothstep(0.5, 0.0, dist) * 0.05;
        
        vec2 smokeUv = uv + normalize(delta + 0.0001) * force;

        smokeUv.x += uTime * 0.02;

        vec3 p = vec3(smokeUv * 1.0, uTime * 0.015);

        vec3 q = vec3(0.0);
        q.x = fbm(p + vec3(0.0, 0.0, uTime * 0.012));
        q.y = fbm(p + vec3(5.2, 1.3, uTime * 0.014));

        vec3 r = vec3(0.0);
        r.x = fbm(p + 3.0 * q + vec3(1.7, 9.2, uTime * 0.018));
        r.y = fbm(p + 3.0 * q + vec3(8.3, 2.8, uTime * 0.015));

        float f = fbm(p + 4.0 * r);

        vec3 colorBg = vec3(0.01, 0.01, 0.01);
        vec3 colorMid = vec3(0.12, 0.12, 0.12);
        vec3 colorHigh = vec3(0.25, 0.25, 0.25);
        vec3 colorHot = vec3(0.4, 0.4, 0.4);

        vec3 col = mix(colorBg, colorMid, clamp(f * f * 2.5, 0.0, 1.0));
        col = mix(col, colorHigh, clamp(length(q) * 1.2, 0.0, 1.0));
        col = mix(col, colorHot, clamp(length(r.x) * 1.5, 0.0, 1.0) * f * 1.2);

        float vignette = smoothstep(1.2, 0.1, length(originalUv));
        col *= vignette;

        float grain = fract(sin(dot(vUv * (uTime * 0.1), vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
        col += grain;

        gl_FragColor = vec4(col, 1.0);
    }
`;

export default function ProceduralSmoke() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    containerRef.current.appendChild(renderer.domElement);

    const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthWrite: false,
        depthTest: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType
    });

    const composer = new EffectComposer(renderer, renderTarget);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.3,
        0.8,
        0.6
    );
    composer.addPass(bloomPass);

    let targetMouse = new THREE.Vector2(0.5, 0.5);
    let currentMouse = new THREE.Vector2(0.5, 0.5);

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
        let x, y;
        if ('touches' in event) {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        
        targetMouse.x = x / window.innerWidth;
        targetMouse.y = 1.0 - (y / window.innerHeight);
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        renderer.setSize(w, h);
        composer.setSize(w, h);
        uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        currentMouse.lerp(targetMouse, 0.05);
        uniforms.uMouse.value.copy(currentMouse);
        uniforms.uTime.value = clock.getElapsedTime();

        composer.render();
    };

    animate();

    return () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animationFrameId);
        
        if (containerRef.current) {
            containerRef.current.removeChild(renderer.domElement);
        }
        
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderTarget.dispose();
        composer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
}
