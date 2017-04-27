var render = function(vertices) {
    if ( ! Detector.webgl ) { Detector.addGetWebGLMessage(); }

    // Set the scene size.
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    // Set some camera attributes.
    const VIEW_ANGLE = 45;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 10000;

    var lut;
    var colorMap;
    var numberOfColors;

    // Get the DOM element to attach to
    const container =
        document.querySelector('#canvas_container');

    'use strict';
    // 'To actually be able to display anything with Three.js, we need three things:
    // A scene, a camera, and a renderer so we can render the scene with the camera.'
    // - http://threejs.org/docs/#Manual/Introduction/Creating_a_scene

    var scene, camera, renderer;

    // I guess we need this stuff too
    var fieldOfView, aspectRatio,
        nearPlane, farPlane, stats,
        geometry,
        i, h, color, size,
        materials = new THREE.PointsMaterial( { color: 0x888888, size: 0.3, vertexColors : THREE.VertexColors } ),
        mouseX = 0,
        mouseY = 0,
        windowHalfX, windowHalfY, cameraZ,
        fogHex, fogDensity, parameters = {},
        parameterCount, particles;

    // clearScene();
    init();
    animate();

    // function clearScene () {
    //     if (scene != null) {
    //     var elementsInTheScene = scene.children.length;
    //
    //     for ( var i = elementsInTheScene-1; i > 0; i-- ) {
    //         if ( scene.children [ i ].name != 'camera' &&
    //              scene.children [ i ].name != 'ambientLight' &&
    //              scene.children [ i ].name != 'directionalLight') {
    //             scene.remove ( scene.children [ i ] );
    //             }
    //         }
    //     }
    // }

    function init() {
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;

        fieldOfView = 75;
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 1;
        farPlane = 300;

        colorMap = 'rainbow';

        cameraZ = farPlane / 3;
        fogHex = 0x000000;
        fogDensity = 0.0007;
        numberOfColors = 512;

        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);

        document.body.style.margin = 0;
        document.body.style.overflow = 'hidden';

        geometry = new THREE.BufferGeometry(); /*	NO ONE SAID ANYTHING ABOUT MATH! UGH!	*/

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Compute the LUT Colors
        var lutColors = [];
        lut = new THREE.Lut( colorMap, numberOfColors );

        var minZ = Number.MAX_VALUE;
        var maxZ = -1 * Number.MAX_VALUE
        for (var i = 0; i < vertices.length; i += 3) {
            var z = vertices[i+2]; // Take the Z coordinate
            if (z < minZ) {
                minZ = z;
            }

            if (z > maxZ) {
                maxZ = z;
            }
            color = lut.getColor( z );
            if ( color == undefined ) {
                console.log( "ERROR: " + colorValue );
            } else {
                lutColors[ i     ] = color.r;
                lutColors[ i + 1 ] = color.g;
                lutColors[ i + 2 ] = color.b;
            }
        }

        lut.setMax(maxZ);
        lut.setMin(minZ);

        var legendLayout = 'vertical';
        geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( lutColors ), 3 ) );



        particles = new THREE.Points(geometry, materials);
        scene.add(particles);

        renderer = new THREE.WebGLRenderer(); /*	Rendererererers particles.	*/
        renderer.setPixelRatio(window.devicePixelRatio); /*	Probably 1; unless you're fancy.	*/
        renderer.setSize(WIDTH, HEIGHT); /*	Full screen baby Wooooo!	*/

        container.appendChild(renderer.domElement); /* Let's add all this crazy junk to the page.	*/

        /*	I don't know about you, but I like to know how bad my
		code is wrecking the performance of a user's machine.
		Let's see some damn stats!	*/

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.right = '0px';
        container.appendChild(stats.domElement);

        /* Event Listeners */
        controls = new THREE.TrackballControls( camera );

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];

        controls.addEventListener( 'change', render );

        render();
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();

        render();

    }

    function animate() {

        requestAnimationFrame( animate );
        controls.update();

    }

    function render() {

        renderer.render( scene, camera );
        stats.update();

    }
};
