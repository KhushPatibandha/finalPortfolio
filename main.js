import * as THREE from './three.js-master/three.js-master/build//three.module.js'
import { GLTFLoader } from './three.js-master/three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { TrackballControls } from './three.js-master/three.js-master/examples/jsm/controls/TrackballControls.js'

let scene, camera, renderer, starGeo, stars, root, shuttles = [];

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 10;
    camera.position.x = Math.PI / 2;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    starGeo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 6000; i++) {
        const star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        );
        star.velocity = 0;
        star.acceleration = 0.02;
        vertices.push(star.x, star.y, star.z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const sprite = new THREE.TextureLoader().load('/assets/star.jpg');
    const starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite,
        transparent: true,
        alphaTest: 0.5,
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);


    const loader = new GLTFLoader();
    loader.load('assets/low_poly_space_shuttle/scene.gltf', function(gltf) {
        console.log(gltf);
        root = gltf.scene;

        root.scale.set(0.001, 0.001, 0.001);

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('assets/low_poly_space_shuttle/textures/Material_diffuse.jpeg', function() {
            const material = new THREE.MeshPhongMaterial({ map: texture });
            root.traverse(function(node) {
                if (node.isMesh) {
                    node.material = material;
                }
            });
        });

        const clonedModel = root.clone();

        for(let i = 0; i < 4; i++) {
            const instance = clonedModel.clone();
            const textureCLone = textureLoader.load('assets/low_poly_space_shuttle/textures/Material_diffuse.jpeg', function() {
                const materialClone = new THREE.MeshPhongMaterial({ map: textureCLone });
                instance.traverse(function(node) {
                    if(node.isMesh) {
                        node.material = materialClone;
                    }
                })
            })

            instance.position.set(
                getRandomPosition(100),
                getRandomPosition(100),
                getRandomPosition(100)
            )
            instance.scale.set(0.001, 0.001, 0.001);

            scene.add(instance);
            shuttles.push(instance);
        }
        scene.add(clonedModel);


        scene.add(root);

        const controls = new TrackballControls(camera, renderer.domElement);
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            if (root !== undefined) {
                root.position.z += 0.05;
            }

            shuttles.forEach((shuttle) => {
                shuttle.position.z += 0.05; // Move the instance in a straight line

                if (shuttle.position.z > 300) {
                    shuttle.position.z = -300;
                    shuttle.position.x = getRandomPosition(100);
                    shuttle.position.y = getRandomPosition(100);
                }
            });
            renderer.render(scene, camera);
        }
        
        animate();
    }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + "% loaded");
    }, function(error) {
        console.log('An error occurred');
    });
    const light = new THREE.AmbientLight(0xffffff, 1);
    light.position.set(2, 2, 5);
    scene.add(light);
    
    animate();
}

function animate() {
    starGeo.attributes.position.array.forEach((_, index) => {
        const x = starGeo.attributes.position.array[index * 3];
        const y = starGeo.attributes.position.array[index * 3 + 1];
        const z = starGeo.attributes.position.array[index * 3 + 2];
        
        starGeo.attributes.position.array[index * 3 + 2] += 1.0; // Move towards the camera
        if (z > 300) {
            starGeo.attributes.position.array[index * 3 + 2] = -300; // Reset position once it goes beyond the screen
        }
    });
    starGeo.attributes.position.needsUpdate = true;
    
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function getRandomPosition(range) {
    return Math.random() * range - range / 2;
}

init();