// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

// Load the model
const loader = new THREE.GLTFLoader();
loader.load('model.gltf', (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  // Create the material for the bars
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Create the bars
  const bars = [];
  for (let i = 0; i < numClasses; i++) {
    const barGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const bar = new THREE.Mesh(barGeometry, material);
    bar.position.x = i * 1.5 - (numClasses - 1) / 2 * 1.5;
    bar.position.y = -1.5;
    scene.add(bar);
    bars.push(bar);
  }

  // Render the scene
  function render() {
    requestAnimationFrame(render);

    // Update the bars' heights based on the classification results
    for (let i = 0; i < numClasses; i++) {
      bars[i].scale.y = results[i];
      bars[i].position.y = -1.5 + results[i] / 2;
    }

    renderer.render(scene, camera);
  }

  render();
});
