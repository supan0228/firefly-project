<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// 设置引用和变量
const threeContainer = ref(null); // 用于渲染的 DOM 容器

let scene, camera, renderer, composer, particles, animationFrameId, controls;
const noise = createNoise2D(); // 使用 SimplexNoise 创建噪声生成器
let time = 0; // 时间变量，用于驱动噪声的变化

// 初始化 Three.js 场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();

  // 创建摄像机，调整视角范围
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
  camera.position.set(0, 0, 300); // 调整相机位置更适合移动端
  camera.lookAt(0, 0, 0);

  // 创建渲染器并优化性能
  renderer = new THREE.WebGLRenderer({ 
    antialias: window.devicePixelRatio < 2, // 在低分辨率设备上启用抗锯齿
    powerPreference: "high-performance" 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比以提高性能
  threeContainer.value.appendChild(renderer.domElement);

  // 创建粒子系统（球体粒子）- 根据设备性能调整数量
  particles = new THREE.Group();
  const isMobile = window.innerWidth < 768;
  const particlesCount = isMobile ? 100 : 200; // 移动端减少粒子数量

  for (let i = 0; i < particlesCount; i++) {
      const geometry = new THREE.SphereGeometry(2, 5, 5); // 减小球体大小
      const material = new THREE.MeshStandardMaterial({
          emissive: new THREE.Color("#CCFF00"), // 自发光颜色
          emissiveIntensity: 1.5, // 自发光强度
      });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.x = Math.random() * 600 - 300; // 扩大分布范围
      particle.position.y = Math.random() * 600 - 300;
      particle.position.z = Math.random() * 600 - 300;

      particles.add(particle);
  }
  scene.add(particles);

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.5, 1000);
  pointLight.position.set(200, 300, 400);
  scene.add(pointLight);

  // 添加相机控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 添加阻尼效果使移动更平滑
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = false; // 禁用平移以避免用户迷失
  controls.maxDistance = 500; // 限制缩放范围
  controls.minDistance = 100;
  controls.update();

  // 初始化后期处理
  initPostProcessing();

  // 处理窗口大小变化
  window.addEventListener('resize', onWindowResize);
};

// 初始化后期处理
const initPostProcessing = () => {
  composer = new EffectComposer(renderer);

  // 场景渲染 Pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 光晕效果 Pass
  const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // 强度
      0.3, // 半径
      0.25 // 阈值
  );
  composer.addPass(bloomPass);
};

// 窗口大小变化时更新渲染器和相机
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
};

// 更新粒子位置
const updateParticles = () => {
  particles.children.forEach((particle) => {
      const { x, y, z } = particle.position;

      // 使用噪声来更新粒子的位置
      particle.position.x += noise(x, time) * 3; // X
      particle.position.y += noise(y, time) * 3; // Y
      particle.position.z += noise(z, time) * 3; // Z
  });

  time += 0.1; // 增加时间，控制噪声变化
};

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  
  updateParticles();
  
  // 更新控制器
  controls?.update();
  
  // 渲染场景（使用后期处理）
  composer.render();
};

// 销毁场景
const destroyScene = () => {
  cancelAnimationFrame(animationFrameId);
  composer.dispose();
  renderer.dispose();
  window.removeEventListener('resize', onWindowResize);
};

// 生命周期钩子
onMounted(() => {
  initScene();
  animate();
});

onUnmounted(() => {
  destroyScene();
});
</script>

<style>
.three-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  overflow: hidden;
}
</style>
