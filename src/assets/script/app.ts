import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Sketch {
    static get CAMERA_PARAM() {
        return {
            fovy: 60,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 20.0,
            x: 0.0,
            y: 2.0,
            z: 10.0,
            lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
        };
    }

    static get RENDERER_PARAM() {
        return {
            clearColor: 0x666666,
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }

    static get MATERIAL_PARAM() {
        return {
            color: 0x3399ff,
        };
    }

    /**
   * 平行光源定義のための定数 @@@
   */
    static get DIRECTIONAL_LIGHT_PARAM() {
        return {
            color: 0xffffff, // 光の色
            intensity: 1.0,  // 光の強度
            x: 4.0,          // 光の向きを表すベクトルの X 要素
            y: 3.0,          // 光の向きを表すベクトルの Y 要素
            z: 6.0           // 光の向きを表すベクトルの Z 要素
        };
    }

    constructor(opstions) {
        this.container = opstions.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        // レンダラ
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(new THREE.Color(Sketch.RENDERER_PARAM.clearColor));
        this.renderer.setSize(Sketch.RENDERER_PARAM.width, Sketch.RENDERER_PARAM.height);
        this.container.appendChild(this.renderer.domElement);

        // シーン
        this.scene = new THREE.Scene();

        // カメラ
        this.camera = new THREE.PerspectiveCamera(
            Sketch.CAMERA_PARAM.fovy,
            Sketch.CAMERA_PARAM.aspect,
            Sketch.CAMERA_PARAM.near,
            Sketch.CAMERA_PARAM.far,
        );
        this.camera.position.set(
            Sketch.CAMERA_PARAM.x,
            Sketch.CAMERA_PARAM.y,
            Sketch.CAMERA_PARAM.z,
        );
        this.camera.lookAt(Sketch.CAMERA_PARAM.lookAt);

        // コントロール
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // ヘルパー
        const axesBarLength = 5.0;
        this.axesHelper = new THREE.AxesHelper(axesBarLength);
        this.scene.add(this.axesHelper);

        this.addObjects();
        // ライトを追加 @@@
        this.addLight();
        this.render();

        // リサイズイベント
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }, false);

        this.isDown = false; // キーの押下状態を保持するフラグ @@@

        // キーの押下や離す操作を検出できるようにする @@@
        window.addEventListener('keydown', (keyEvent) => {
            // スペースキーが押されている場合はフラグを立てる
            switch (keyEvent.key) {
                case ' ':
                    this.isDown = true;
                    break;
                case 'c':
                    this.controls.reset();
                    this.mesh.rotation.y = 0;
                    break;
                default:
            }
        }, false);
        window.addEventListener('keyup', (keyEvent) => {
            // なんらかのキーが離された操作で無条件にフラグを下ろす
            this.isDown = false;
        }, false);
    }

    addObjects() {
        this.geometry = new THREE.TorusKnotGeometry(2, 0.6, 300, 26);

        // マテリアル @@@
        // - ライトを有効にするためにマテリアルを変更する -------------------------
        // ライトというと照らす側の光源のことばかり考えてしまいがちですが、その光を
        // 受け取る側の準備も必要です。
        // 具体的には、メッシュに適用するマテリアルをライトを受けることができるタイ
        // プに変更します。いくつかある対応するマテリアルのうち、今回はまずランバー
        // トマテリアルを選択します。
        // three.js には、ライトの影響を受けるマテリアルと、そうでないマテリアルがあ
        // ります。以前までのサンプルで利用していた MeshBasicMaterial は、ライトの影
        // 響を受けないマテリアルです。（基本的にベタ塗りになる）
        // ------------------------------------------------------------------------
        this.material = new THREE.MeshLambertMaterial(Sketch.MATERIAL_PARAM);

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    addLight() {
        // ライト（平行光源） @@@
        this.directionalLight = new THREE.DirectionalLight(
            Sketch.DIRECTIONAL_LIGHT_PARAM.color,
            Sketch.DIRECTIONAL_LIGHT_PARAM.intensity
        );
        this.directionalLight.position.set(
            Sketch.DIRECTIONAL_LIGHT_PARAM.x,
            Sketch.DIRECTIONAL_LIGHT_PARAM.y,
            Sketch.DIRECTIONAL_LIGHT_PARAM.z,
        );

        // ヘルパー @@@
        // - ライトの向きを可視化する -------------------------------------------
        // ライトの向きを可視化するためにヘルパーを追加します。
        // ヘルパーはライトをシーンに追加するときに同時に追加します。
        // ------------------------------------------------------------------
        const helper = new THREE.DirectionalLightHelper( this.directionalLight, 2 );
        this.scene.add( helper );

        this.scene.add(this.directionalLight);
    }

    render() {
        // 恒常ループ
        requestAnimationFrame(this.render.bind(this));

        // コントロールを更新
        this.controls.update();

        // フラグに応じてオブジェクトの状態を変化させる @@@
        if (this.isDown === true) {
            // rotation プロパティは Euler クラスのインスタンス
            // XYZ の各軸に対する回転をラジアンで指定する
            this.mesh.rotation.y += 0.5;
        }

        // 描画フェーズ
        this.renderer.render(this.scene, this.camera);
    }
}

new Sketch({
    dom: document.getElementById("container")
});
