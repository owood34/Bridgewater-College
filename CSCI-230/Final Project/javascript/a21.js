// Painting Wandering Above the Sea of Clouds (1818, Casper David Friedrich)

let B = BABYLON
canvas = document.getElementById("canvas")
engine = new B.Engine(canvas, true)
const fog = []
let max_fog_y = -10000
let closest_str = undefined
createScene = () => {

    const scene = new B.Scene(engine)
    scene.ambientColor = new B.Color3(0.8, 0.8, 0.8)
    scene.gravity = new B.Vector3(0, -5, 0)
    scene.collisionsEnabled = true



    camera = createCamera(scene)
    createLights(scene, camera)
    createGround(scene)
    createFogLayer(scene, 70)
    createTrees(scene, 200)
    createForest(scene, 250, 1900, new B.Vector3(1312, 1400, -6626))
    createForest(scene, 250, 1900, new B.Vector3(1260, 1400, -600))
    createForest(scene, 30, 500, new B.Vector3(2800, 1400, -3140))
    createForest(scene, 30, 700, new B.Vector3(1234, 1400, -4000))
    createRocks(scene, 1000, 5000, new B.Vector3(0, 1400, 0))
    createGrass(scene, 5000, 8000)
    createPath(scene)
    createStructures(scene)
    createInterior(scene)

    createParticleSystem(scene, 300)

    return scene;
}

function createCamera(scene) {
    const camera = new B.UniversalCamera("camera", new B.Vector3(-886, 3205, 1941), scene) // new B.Vector3(-886, 3205, 1941) new B.Vector3(5600, -2100, -6029)
    camera.setTarget(new B.Vector3(-5399, 2285, -1160))
    camera.attachControl(scene, true);
    camera.applyGravity = true
    camera.checkCollisions = true
    camera.ellipsoid = new B.Vector3(5, 35, 5)
    camera.speed = 10;
    camera.rotation.y = -Math.PI / 2
    camera.maxZ = 100000000000
    camera.minZ = 0.1

    return camera
}

function createLights(scene, camera) {
    const light1 = new B.HemisphericLight("HemiLight", new B.Vector3(0.2, 1, 0), scene);
    light1.groundColor = new B.Color3(0, 0, 0);
    light1.diffuse = new B.Color3(0.5, 0.5, 0.5);
    light1.specular = new B.Color3(0, 0, 0);
    light1.intensity = 0.5

    const light2 = new B.DirectionalLight("DirectionalLight", new B.Vector3(0.3, -1, 0.3), scene);
    light2.position = new B.Vector3(0, 60, 0);
    light2.diffuse = new B.Color3(1, 1, 1);
    light2.specular = new B.Color3(0, 0, 0);
    light2.intensity = 0.3

    const spotLight = new BABYLON.SpotLight("spot02", new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 1), Math.PI / 2, 100, scene)
    spotLight.intensity = 0.3
    spotLight.parent = camera
}

function createGround(scene) {
    let ground = B.MeshBuilder.CreateGroundFromHeightMap("ground", "image/a21/heightmap/a21_hm3.png",
        { width: 20000, height: 20000, subdivisions: 90, maxHeight: 3000, minHeight: -3000 }, scene, true)
    ground.checkCollisions = true
    ground.position.y = 300
    ground.inertia = 0.25

    let ground_texture = new B.StandardMaterial("ground_texture", scene)
    ground_texture.diffuseTexture = new B.Texture("image/a21/texture/ground.jpg", scene)
    ground.material = ground_texture

    let skybox = B.Mesh.CreateBox("skybox", 50000, scene)
    skybox.infiniteDistance = true
    skybox.position.y = 0

    skybox_material = new B.StandardMaterial("skybox_material", scene)
    skybox_material.backFaceCulling = false

    let files = ["_px.jpg", "_py.jpg", "_pz.jpg", "_nx.jpg", "_ny.jpg", "_nz.jpg"]
    skybox_material.reflectionTexture = new B.CubeTexture("image/a21/skybox/bluecloud", scene, files)
    skybox_material.reflectionTexture.coordinateMode = B.Texture.SKYBOX_MODE
    skybox_material.diffuseColor = new B.Color3(0, 0, 0)
    skybox_material.specularColor = new B.Color3(0, 0, 0)
    skybox.material = skybox_material
}

function createFogLayer(scene, capacity) {
    for (let i = 0; i < capacity; i++) {
        let layer = B.MeshBuilder.CreatePlane("fog_layer", { height: 8000, width: 8000, sideOrientation: BABYLON.Mesh.DOUBLESIDE });
        layer.position.x = B.Scalar.RandomRange(-8000, 8000)
        layer.position.y = B.Scalar.RandomRange(2000, 2500)
        layer.position.z = B.Scalar.RandomRange(-8000, 8000)
        layer.rotation.x = Math.PI / 2
        layer.opacity = 0.4
        max_fog_y = (max_fog_y < layer.position.y) ? layer.position.y : max_fog_y

        let fog_material = new B.StandardMaterial("fog_material", scene)
        fog_material.diffuseTexture = new B.Texture("image/a21/texture/fog.png", scene)
        fog_material.diffuseTexture.hasAlpha = true

        fog_material.opacityTexture = new B.Texture("image/a21/texture/fog.png", scene)
        fog_material.opacityTexture.hasAlpha = true
        fog_material.opacityTexture.level = 2

        fog_material.alpha = 0.5

        layer.material = fog_material

        let fog_animation = new B.AnimationGroup("fog_animation")
        fog_animation.addTargetedAnimation(fogAnimation(), layer)
        scene.animationGroups[i].play(true)
        fog.push(layer)
    }

}

function fogAnimation() {
    let frameRate = 10
    let animation = new B.Animation("fogAnimation",
        "rotation.y",
        frameRate,
        B.Animation.ANIMATIONTYPE_FLOAT,
        B.Animation.ANIMATIONLOOPMODE_CYCLE)

    const keyframes = []

    keyframes.push({
        frame: 0,
        value: 0
    })

    keyframes.push({
        frame: 10 * frameRate,
        value: Math.PI / 2
    })

    keyframes.push({
        frame: 20 * frameRate,
        value: Math.PI
    })

    keyframes.push({
        frame: 30 * frameRate,
        value: 1.5 * Math.PI
    })

    keyframes.push({
        frame: 40 * frameRate,
        value: 1.9999 * Math.PI
    })

    animation.setKeys(keyframes)

    return animation
}

let trees = []

function createTrees(scene, scale) {

    let trees_position = []
    trees_position.push(new B.Vector3(-5399, 2285, -1160))
    trees_position.push(new B.Vector3(-5300, 2285, -1100))
    trees_position.push(new B.Vector3(-5536, 2240, -977))
    trees_position.push(new B.Vector3(-5353, 2280, -954))
    trees_position.push(new B.Vector3(-3467, 2290, -1054))
    trees_position.push(new B.Vector3(-3294, 2280, -1260))
    trees_position.push(new B.Vector3(-1647, 3150, -4801))
    trees_position.push(new B.Vector3(-5353, 2280, -954))
    trees_position.push(new B.Vector3(-2064, 3150, -4544))
    trees_position.push(new B.Vector3(-1208, 3150, -4963))


    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Trees/", "tree_pineDefaultA.glb", scene,
        (meshes) => {
            let tree = B.Mesh.MergeMeshes([meshes[1], meshes[2]], true, true, undefined, false, true)
            tree.name = "t0"
            tree.checkCollisions = true
            tree.isVisible = true

            for (let i = 0; i < trees_position.length; i++) {
                let newTree = tree.createInstance("t" + (i + 1))
                newTree.position = trees_position[i]
                newTree.scaling = new B.Vector3(scale, scale, scale)
                console.log("Loaded Trees at position: " + newTree.position)
                trees.push(newTree)
            }
        })

    scene.activeCamera.setTarget(new B.Vector3(-5536, 2240, -977))
}

function createForest(scene, number, spread, center) {

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Trees/", "tree_pineDefaultA.glb", scene,
        (meshes) => {
            let scale = 200 + B.Scalar.RandomRange(-10, 30)
            let tree = B.Mesh.MergeMeshes([meshes[1], meshes[2]], true, true, undefined, false, true)
            tree.name = "f0"
            tree.checkCollisions = true
            tree.isVisible = true

            for (let i = 0; i < number; i++) {
                let newTree = tree.createInstance("t" + (i + 1))
                newTree.position.x = center.x + B.Scalar.RandomRange(-spread, spread)
                newTree.position.z = center.z + B.Scalar.RandomRange(-spread, spread)
                newTree.position.y = center.y
                newTree.scaling = new B.Vector3(scale, scale, scale)
                console.log("Loaded Trees at position: " + newTree.position)
                trees.push(newTree)
            }

        })
}

function createPath(scene) {
    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Bridges/", "bridge_stone.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => mesh.checkCollisions = true)
            meshes[1].position = new B.Vector3(-20, 3120, 2600)
            meshes[1].scaling = new B.Vector3(900, 200, 200)
            meshes[1].rotation.y = 0.25
            console.log("Loaded Bridge at position: " + meshes[1].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "cliff_steps_stone.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => mesh.checkCollisions = true)
            meshes[1].position = new B.Vector3(-1173, 2900, 3940)
            meshes[1].scaling = new B.Vector3(200, 200, 200)
            meshes[1].rotation.y = Math.PI
            console.log("Loaded Moss Stair at position: " + meshes[1].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "cliff_steps_stone.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => mesh.checkCollisions = true)
            meshes[1].position = new B.Vector3(-1200, 2700, 4110)
            meshes[1].scaling = new B.Vector3(200, 200, 200)
            meshes[1].rotation.y = Math.PI
            console.log("Loaded Moss Stair at position: " + meshes[1].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "cliff_stepsCorner_stone.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => mesh.checkCollisions = true)
            meshes[1].position = new B.Vector3(-1240, 2600, 4300)
            meshes[1].scaling = new B.Vector3(200, 200, 200)
            meshes[1].rotation.y = Math.PI
            console.log("Loaded Moss Stair Corner at position: " + meshes[1].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "stone_step.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => mesh.checkCollisions = true)
            meshes[1].position = new B.Vector3(-1420, 2450, 4300)
            meshes[1].scaling = new B.Vector3(400, 200, 500)
            meshes[1].rotation.y = Math.PI
            console.log("Loaded Stone Stair at position: " + meshes[1].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "stone_step.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => {
                mesh.checkCollisions = true
                mesh.rotation.y = 0
            })
            meshes[1].position = new B.Vector3(-1420, 2300, 4150)
            meshes[1].scaling = new B.Vector3(500, 250, 200)
            console.log("Loaded Stone Stair at position: " + meshes[1].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "stone_step.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => {
                mesh.checkCollisions = true
                mesh.rotation.y = Math.PI
            })
            meshes[1].position = new B.Vector3(-1420, 2100, 4150)
            meshes[1].scaling = new B.Vector3(500, 400, 300)
            console.log("Loaded Stone Stair at position: " + meshes[1].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "stone_step.glb", scene,
        (meshes) => {
            for (let i = 2; i < meshes.length; i++) {
                meshes[i].setParent(meshes[1])
            }
            meshes.forEach((mesh) => {
                mesh.checkCollisions = true
                mesh.rotation.y = (Math.PI / 2) - 0.3
            })
            meshes[1].position = new B.Vector3(-1500, 2200, 4200)
            meshes[1].scaling = new B.Vector3(500, 400, 300)
            console.log("Loaded Stone Stair at position: " + meshes[1].position)
        })
}

function createRocks(scene, number, spread, center) {
    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "stone_smallFlatA.glb", scene,
        (meshes) => {
            let scale = 50 + B.Scalar.RandomRange(-10, 30)
            let rock = meshes[1]
            rock.name = "s0"
            rock.checkCollisions = true
            rock.isVisible = true

            for (let i = 0; i < number; i++) {
                let newRock = rock.createInstance("s" + (i + 1))
                newRock.position.x = center.x + B.Scalar.RandomRange(-spread, spread)
                newRock.position.z = center.z + B.Scalar.RandomRange(-spread, spread)
                newRock.position.y = center.y
                newRock.scaling = new B.Vector3(scale, scale, scale)
                console.log("Loaded Rock at position: " + newRock.position)
            }

        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Rocks/", "stone_small.glb", scene,
        (meshes) => {
            let scale = 50 + B.Scalar.RandomRange(-10, 30)
            let rock = meshes[1]
            rock.name = "r0"
            rock.checkCollisions = true
            rock.isVisible = true

            for (let i = 0; i < number; i++) {
                let newRock = rock.createInstance("r" + (i + 1))
                newRock.position.x = center.x + B.Scalar.RandomRange(-spread, spread)
                newRock.position.z = center.z + B.Scalar.RandomRange(-spread, spread)
                newRock.position.y = center.y
                newRock.scaling = new B.Vector3(scale, scale, scale)
                console.log("Loaded Rock at position: " + newRock.position)
            }

        })
}

function createGrass(scene, number, spread) {
    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Grass/", "grass.glb", scene,
        (meshes) => {
            let scale = 30 + B.Scalar.RandomRange(-10, 30)
            let grass = meshes[1]
            grass.name = "g0"
            grass.checkCollisions = true
            grass.isVisible = true

            for (let i = 0; i < number; i++) {
                let newGrass = grass.createInstance("g" + (i + 1))
                newGrass.position.x = 886 + B.Scalar.RandomRange(-spread, spread)
                newGrass.position.z = 1941 + B.Scalar.RandomRange(-spread, spread)
                newGrass.position.y = 1400
                newGrass.scaling = new B.Vector3(scale, scale, scale)
                console.log("Loaded Grass at position: " + newGrass.position)
            }

        })
}

let structure = []
let candle = undefined

function createStructures(scene) {
    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_1.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => mesh.checkCollisions = false)
            meshes[0].position = new B.Vector3(5016, 1400, -6086)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_1.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => mesh.checkCollisions = false)
            meshes[0].position = new B.Vector3(5600, 1400, -6029)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = true
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_2.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = false
                mesh.rotation.y = Math.PI
            })
            meshes[0].position = new B.Vector3(6000, 1400, -6000)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_1.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => mesh.checkCollisions = false)
            meshes[0].position = new B.Vector3(6400, 1400, -5930)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_2.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = false
                mesh.rotation.y = Math.PI
            })
            meshes[0].position = new B.Vector3(6800, 1400, -5900)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_2.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => mesh.checkCollisions = false)
            meshes[0].position = new B.Vector3(5800, 1400, -7000)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_2.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => mesh.checkCollisions = false)
            meshes[0].position = new B.Vector3(5390, 1400, -8410)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "tower_bell_medieval_1.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = false
                mesh.rotation.y = Math.PI - 0.2
            })
            meshes[0].position = new B.Vector3(6235, 1400, -8410)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "blacksmith_medieval_1.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => mesh.checkCollisions = false)
            meshes[0].position = new B.Vector3(6583, 1400, -7000)
            meshes[0].scaling = new B.Vector3(175, 175, 175)
            meshes[0].isInteractable = false
            structure.push(meshes[0])
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "house_medieval_1.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = false
                mesh.rotation.y = Math.PI
            })
            meshes[0].position = new B.Vector3(5850, 1400, -8435)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            console.log("Loaded Building at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Buildings/", "sawmill_medieval_1.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => mesh.checkCollisions = true)
            meshes[0].position = new B.Vector3(3570, 1397, -4510)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            meshes[0].isInteractable = false
            console.log("Loaded Building at position: " + meshes[0].position)
        })
}

function createInterior(scene) {
    let floor = B.MeshBuilder.CreatePlane("floor", { height: 400, width: 400, sideOrientation: B.Mesh.DOUBLESIDE })
    let floor_material = new B.StandardMaterial("floor_material", scene)
    floor_material.diffuseTexture = new B.Texture("image/a21/texture/wooden_floor.png", scene)

    floor.material = floor_material
    floor.position = new B.Vector3(5600, -2100, -6029)
    floor.rotation.x = Math.PI / 2
    floor.checkCollisions = true

    let wall_material = new B.StandardMaterial("wall_material", scene)
    wall_material.diffuseTexture = new B.Texture("image/a21/texture/stone_wall.png", scene)

    let wall_1 = B.MeshBuilder.CreatePlane("wall", { height: 400, width: 600, sideOrientation: B.Mesh.BACKSIDE })
    wall_1.material = wall_material

    wall_1.position = new B.Vector3(5400, -2000, -6029)
    wall_1.rotation.y = (-3 * Math.PI) / 2
    wall_1.checkCollisions = true

    let wall_2 = B.MeshBuilder.CreatePlane("wall", { height: 400, width: 600, sideOrientation: B.Mesh.DEFAULTSIDE })
    wall_2.material = wall_material

    wall_2.position = new B.Vector3(5800, -2000, -6029)
    wall_2.rotation.y = Math.PI / 2
    wall_2.checkCollisions = true

    let wall_3 = B.MeshBuilder.CreatePlane("wall", { height: 400, width: 600, sideOrientation: B.Mesh.BACKSIDE })
    wall_3.material = wall_material

    wall_3.position = new B.Vector3(5600, -2000, -6229)
    wall_3.rotation.y = 0
    wall_3.checkCollisions = true

    let wall_4 = B.MeshBuilder.CreatePlane("wall", { height: 400, width: 600, sideOrientation: B.Mesh.DEFAULTSIDE })
    wall_4.material = wall_material

    wall_4.position = new B.Vector3(5600, -2000, -5829)
    wall_4.rotation.y = 0
    wall_4.checkCollisions = true

    let ceiling = B.MeshBuilder.CreatePlane("ceiling", { height: 400, width: 400, sideOrientation: B.Mesh.DOUBLESIDE })
    ceiling.position = new B.Vector3(5600, -1800, -6029)
    ceiling.rotation.x = Math.PI / 2
    ceiling.material = floor_material

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Interior/", "Bag_Open.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = true
                mesh.rotation.y = -0.8
            })
            meshes[0].position = new B.Vector3(5500, -2100, -6129)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            console.log("Loaded Bag at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Interior/", "Bag_Open.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = true
                mesh.rotation.y = -1.7
            })
            meshes[0].position = new B.Vector3(5510, -2100, -6189)
            meshes[0].scaling = new B.Vector3(200, 200, 200)
            console.log("Loaded Bag at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Interior/", "tableplain02.gltf", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = true
                mesh.rotation.x = Math.PI
            })
            meshes[0].position = new B.Vector3(5710, -2100, -6190)
            meshes[0].scaling = new B.Vector3(50, 50, 50)
            console.log("Loaded Table at position: " + meshes[0].position)
        })

    B.SceneLoader.ImportMesh(null, "./image/a21/assets/GLTF/Interior/", "candle.glb", scene,
        (meshes) => {
            for (let i = 1; i < meshes.length; i++) {
                meshes[i].setParent(meshes[0])
            }

            meshes.forEach((mesh) => {
                mesh.checkCollisions = true
                mesh.rotation.x = Math.PI
            })
            meshes[0].position = new B.Vector3(5710, -2057, -6190)
            meshes[0].scaling = new B.Vector3(25, 25, 25)
            candle = meshes[0]
            console.log("Loaded Candle at position: " + meshes[0].position)
        })

    const candleLight = new BABYLON.PointLight("candle_light", new B.Vector3(5710, -2057, -6190), scene)
    candleLight.intensity = 0.3
    candleLight.diffuse = new B.Color3.FromHexString('FF0000').toLinearSpace()
    candleLight.specular = new B.Color3.FromHexString('000000').toLinearSpace()
    candleLight.parent = candle

}

async function createParticleSystem(scene, capacity) {
    const particleSystem = new BABYLON.ParticleSystem("particles", capacity, scene)
    particleSystem.particleTexture = new BABYLON.Texture("./image/a21/texture/smoke.png");

    particleSystem.emitter = new B.Vector3(5723, -2045, -6190)
    particleSystem.emitRate = 50;

    particleSystem.start();

    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 6;

    particleSystem.gravity = new BABYLON.Vector3(0, 1.7, 0);

    let nodeMaterial = await BABYLON.NodeMaterial.ParseFromSnippetAsync("HMP5KD#5", scene);
    nodeMaterial.createEffectForParticles(particleSystem);
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    console.log(particleSystem)
}

let scene = createScene()

let prevPos = new B.Vector3(-886, 3205, 1941)
let isWalking = false
let canInteract = false
let buildboard = undefined
let smallest_distance = new B.Vector3(10000, 10000, 10000)
let smallest_distance_structure = undefined

let footstep = new B.Sound("footstep_sound",
    "./audio/a21/footsteps.wav",
    scene,
    null,
    { loop: true, volume: 0.7, autoplay: false }
)

let wind = new B.Sound("wind_sound",
    "./audio/a21/wind.wav",
    scene,
    null,
    { loop: true, volume: 0.1, autoplay: true }
)

let door_open = new B.Sound("door_sound",
    "./audio/a21/door_open.wav",
    scene,
    null,
    { loop: false, volume: 1, autoplay: false }
)

let footstep_wood = new B.Sound("footstep_wood_sound",
    "./audio/a21/footstep_wooden_floor.mp3",
    scene,
    null,
    { loop: true, volume: 0.7, autoplay: false }
)

scene.actionManager = new B.ActionManager(scene)

scene.actionManager.registerAction(new B.ExecuteCodeAction(
    {
        trigger: B.ActionManager.OnKeyUpTrigger,
        parameter: 'e'
    },
    () => {
        console.log(canInteract)
        if (canInteract) {
            scene.activeCamera.position = new B.Vector3(5680, 1487, -6521)
            canInteract = false
        }

        if (buildboard != undefined) {
            structure.forEach((str) => {
                let distance = scene.activeCamera.position.subtract(str.position)
                distance.x = (distance.x < 0) ? -1 * distance.x : distance.x
                distance.z = (distance.z < 0) ? -1 * distance.z : distance.z
                if (str.isInteractable) {
                    if (smallest_distance.x > distance.x && smallest_distance.z > distance.z) {
                        smallest_distance = distance
                        smallest_distance_structure = str
                    }
                }
            })
            canInteract = true
            scene.activeCamera.position = smallest_distance_structure.position.add(new B.Vector3(-100, -3400, 0))
            console.log(scene.activeCamera.position)
        }

        door_open.play()

    }
))

engine.runRenderLoop(() => {
    scene.render()
})

scene.registerAfterRender(() => {
    for (let f of fog) {
        f.position.x = (f.position.x > 8000) ? -8000 : ++(f.position.x)
    }

    if (scene.activeCamera.position.y < max_fog_y) {
        scene.fogMode = B.Scene.FOGMODE_EXP
        scene.fogDensity = 0.0002
        scene.fogColor = new B.Color3.FromHexString('#ABAEB0').toLinearSpace()
    } else {
        scene.fogMode = null
    }

    trees.forEach((tree) => {
        let distance = scene.activeCamera.position.subtract(tree.position)
        if ((distance.x <= 20 && distance.x >= -20) && (distance.z <= 20 && distance.z >= -20)) {
            scene.activeCamera.position = scene.activeCamera.position
                .add(scene.activeCamera.getForwardRay().direction.multiply(new B.Vector3(-20, -20, -20)))
        }
    })

    structure.forEach((str) => {
        let distance = scene.activeCamera.position.subtract(str.position)
        if ((distance.x <= 172 && distance.x >= -172) && (distance.z <= 172 && distance.z >= -172) && scene.activeCamera.position.y > 0) {
            scene.activeCamera.position = scene.activeCamera.position
                .add(scene.activeCamera.getForwardRay().direction.multiply(new B.Vector3(-10, -10, -10)))
        }

        if (str.isInteractable) {
            if ((distance.x <= 265 && distance.x >= -265) && (distance.z <= 265 && distance.z >= -265) && scene.activeCamera.position.y > 0) {
                if (buildboard == undefined) {
                    buildboard = B.MeshBuilder.CreatePlane("interactable_buildboard", { height: 40, width: 40, depth: 1 }, scene)
                    buildboard.position = scene.activeCamera.position
                    buildboard.billboardMode = 7

                    let material = new B.StandardMaterial("buildboard_mat", scene)

                    let dynamic = new B.DynamicTexture("buildboard_text", { height: 512, width: 256 }, scene)
                    dynamic.drawText("Press E to Interact", 30, 120, "20px monospace", "green", "white", true, true)
                    material.diffuseTexture = dynamic

                    buildboard.material = material
                }
                if (buildboard != undefined) {
                    buildboard.position = scene.activeCamera.position
                        .add(scene.activeCamera.getForwardRay().direction.multiply(new B.Vector3(80, 80, 80)))
                }
            }
        } else {
            if ((distance.x <= 265 && distance.x >= -265) && (distance.z <= 265 && distance.z >= -265) && scene.activeCamera.position.y > 0) {
                if (buildboard == undefined) {
                    buildboard = B.MeshBuilder.CreatePlane("interactable_buildboard", { height: 60, width: 60, depth: 1 }, scene)
                    buildboard.position = scene.activeCamera.position
                    buildboard.billboardMode = 7

                    let material = new B.StandardMaterial("buildboard_mat", scene)

                    let dynamic = new B.DynamicTexture("buildboard_text", { height: 512, width: 256 }, scene)
                    dynamic.drawText("The door appears to be locked", 30, 120, "12px monospace", "green", "white", true, true)
                    material.diffuseTexture = dynamic

                    buildboard.material = material
                }
                if (buildboard != undefined) {
                    buildboard.position = scene.activeCamera.position
                        .add(scene.activeCamera.getForwardRay().direction.multiply(new B.Vector3(80, 80, 80)))
                }
            }
        }

        if (buildboard != undefined) {
            let b_dist = buildboard.position.subtract(scene.activeCamera.position)
            let b_dist_X = (b_dist.x < 0) ? b_dist.x * -1 : b_dist.x
            let b_dist_Z = (b_dist.z < 0) ? b_dist.z * -1 : b_dist.z
            if (b_dist_X > 125 || b_dist_Z > 125) {
                buildboard.dispose()
                buildboard = undefined
            }
        }
    })

    if (prevPos.x != scene.activeCamera.position.x ||
        prevPos.y != scene.activeCamera.position.y ||
        prevPos.z != scene.activeCamera.position.z) {

        if (!isWalking) {
            isWalking = true
            if (canInteract) {
                footstep_wood.play()
            } else {
                footstep.play()
            }
        }
        prevPos.x = scene.activeCamera.position.x
        prevPos.y = scene.activeCamera.position.y
        prevPos.z = scene.activeCamera.position.z

    } else {
        isWalking = false
        footstep.pause()
        footstep_wood.pause()
    }
})

window.addEventListener("resize", () => { engine.resize() })