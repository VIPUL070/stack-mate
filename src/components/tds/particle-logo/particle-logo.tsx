"use client";
import { useEffect, useRef } from "react";
import "./particle-logo.css";

const CONFIG = {
  logoSize: 1100,
  radius: 3000,
  force: 0.003,
  maxDisplacement: 100,
  returnForce: 0.025,
  friction: 0.82,
  pointSize: 3.5,
  stride: 2, 
};

const VERT = `
precision highp float;
uniform vec2 u_res;
attribute vec2 a_pos;
attribute vec4 a_color;
varying vec4 v_color;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  v_color = a_color;
  gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
  gl_PointSize = ${CONFIG.pointSize.toFixed(1)};
}`;

const FRAG = `
precision highp float;
varying vec4 v_color;
void main() {
  if (v_color.a < 0.01) discard;
  float d = length(gl_PointCoord - vec2(0.5));
  gl_FragColor = vec4(v_color.rgb, v_color.a * (1.0 - smoothstep(0.0, 0.5, d)));
}`;

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0, 0, 0];
}

export function ParticleLogo({ src, background = "#151714" }: { src: string; background?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (window.innerWidth < 1000 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    canvas.classList.add("tds-particles__canvas--on");

    let cancelled = false;
    let raf = 0;
    let budget = 0; 
    const mouse = { x: -1e6, y: -1e6 };
    let home = new Float32Array(0);
    let pos = new Float32Array(0);
    let vel = new Float32Array(0);
    let count = 0;
    let offsetX = 0;
    let offsetY = 0;
    let visible = true; 

    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const aPos = gl.getAttribLocation(program, "a_pos");
    const aColor = gl.getAttribLocation(program, "a_color");
    const uRes = gl.getUniformLocation(program, "u_res");
    const posBuf = gl.createBuffer();
    const colorBuf = gl.createBuffer();
    const bg = hexToRgb(background);

    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      // Keep the logo centred: shift every dot by the change in centre.
      const nx = (canvas.width - CONFIG.logoSize) / 2;
      const ny = (canvas.height - CONFIG.logoSize) / 2;
      for (let i = 0; i < count; i++) {
        home[i * 2] += nx - offsetX;
        home[i * 2 + 1] += ny - offsetY;
        pos[i * 2] = home[i * 2];
        pos[i * 2 + 1] = home[i * 2 + 1];
      }
      offsetX = nx;
      offsetY = ny;
      if (count) {
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
      }
    };

    const build = (pixels: Uint8ClampedArray) => {
      const dim = CONFIG.logoSize;
      const p: number[] = [];
      const c: number[] = [];
      for (let i = 0; i < dim; i += CONFIG.stride) {
        for (let j = 0; j < dim; j += CONFIG.stride) {
          const k = (i * dim + j) * 4;
          if (pixels[k + 3] > 10) {
            p.push(j, i);
            c.push(pixels[k] / 255, pixels[k + 1] / 255, pixels[k + 2] / 255, pixels[k + 3] / 255);
          }
        }
      }
      count = p.length / 2;
      home = new Float32Array(p);
      pos = new Float32Array(p);
      vel = new Float32Array(p.length);
      offsetX = offsetY = 0;
      size();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(c), gl.STATIC_DRAW);
    };

    const step = () => {
      const r2 = CONFIG.radius * CONFIG.radius;
      for (let i = 0; i < count; i++) {
        const ix = i * 2;
        const x = pos[ix];
        const y = pos[ix + 1];
        const ox = home[ix];
        const oy = home[ix + 1];
        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const dis = dx * dx + dy * dy;
        if (dis < r2 && dis > 0) {
          const f = -r2 / dis;
          const t = Math.atan2(dy, dx);
          const away = Math.hypot(x - ox, y - oy);
          const k = Math.max(0.1, 1 - away / (CONFIG.maxDisplacement * 2));
          vel[ix] += f * Math.cos(t) * CONFIG.force * k;
          vel[ix + 1] += f * Math.sin(t) * CONFIG.force * k;
        }
        vel[ix] *= CONFIG.friction;
        vel[ix + 1] *= CONFIG.friction;
        const nx = x + vel[ix] + (ox - x) * CONFIG.returnForce;
        const ny = y + vel[ix + 1] + (oy - y) * CONFIG.returnForce;
        const ex = nx - ox;
        const ey = ny - oy;
        const d = Math.hypot(ex, ey);
        if (d > CONFIG.maxDisplacement) {
          const s = CONFIG.maxDisplacement / d;
          const damped = s + (1 - s) * Math.exp(-(d - CONFIG.maxDisplacement) * 0.02);
          pos[ix] = ox + ex * damped;
          pos[ix + 1] = oy + ey * damped;
          vel[ix] *= 0.7;
          vel[ix + 1] *= 0.7;
        } else {
          pos[ix] = nx;
          pos[ix + 1] = ny;
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
    };

    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(bg[0], bg[1], bg[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!count) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, count);
    };

    const frame = () => {
      if (!visible) {
        raf = 0;
        return;
      }
      if (budget > 0) {
        budget--;
        step();
      }
      draw();
      raf = budget > 0 ? requestAnimationFrame(frame) : 0;
    };

    const onMove = (e: MouseEvent) => {
      if (!visible) return;
      const r = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      mouse.x = (e.clientX - r.left) * dpr;
      mouse.y = (e.clientY - r.top) * dpr;
      budget = 300;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      size();
      if (visible) draw();
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const tmp = document.createElement("canvas");
      tmp.width = tmp.height = CONFIG.logoSize;
      const ctx = tmp.getContext("2d", { willReadFrequently: true })!;
      const scaled = CONFIG.logoSize * 0.9;
      const off = (CONFIG.logoSize - scaled) / 2;
      ctx.drawImage(img, off, off, scaled, scaled);
      build(ctx.getImageData(0, 0, CONFIG.logoSize, CONFIG.logoSize).data);
      draw();
    };
    img.src = src;
    size();
    draw();
    document.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && budget > 0 && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);

    return () => {
      cancelled = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(colorBuf);
      gl.deleteProgram(program);
      canvas.classList.remove("tds-particles__canvas--on");
    };
  }, [src, background]);

  return (
    <div className="tds-particles" style={{ background }}>
    
      <img className="tds-particles__still" src={src} alt="" />
      <canvas ref={canvasRef} className="tds-particles__canvas" aria-hidden />
    </div>
  );
}