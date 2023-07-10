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

        // ***************** Expiremental (should render multiple 3D models, but doesnt) 
        // When you do i < 3000 (some big number) it will start lagging. That means that some process is running in the background but the cloned models are not getting rendered. 

        // for(let i = 0; i < 10; i++) {
        //     const shuttle = root.clone();
        //     shuttle.position.set(
        //         Math.random() * 600 - 300,
        //         Math.random() * 600 - 300,
        //         Math.random() * 600 - 300,
        //     );
        //     shuttle.scale.set(0.1, 0.1, 0.1);
        //     scene.add(shuttle);
        //     shuttles.push(shuttle);
        // }
        // *****************


        scene.add(root);

        const controls = new TrackballControls(camera, renderer.domElement);
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
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

    // makes the loaded model move in a straight line. 
    if(root != undefined) {
        root.position.z += 0.05;
    }

    // added as an expirement(should work, but dosent)
    // shuttles.forEach((shuttle) => {
    //     // shuttle.position.z += 1;
    //     if(root != undefined) {
    //         shuttle.position.z += 0.05;
    //     }
    //     if(shuttle.position.z > 300) {
    //         shuttle.position.z = -300;
    //     }
    // })

    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
init();