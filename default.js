(function(){
    'use strict';

    // 変数
    var gl, canvas;

    window.addEventListener('load', function(){
        ////////////////////////////
        // 初期化
        ////////////////////////////
        
        // canvas の初期化
        canvas = document.getElementById('canvas');
        canvas.width = 512;
        canvas.height = 512;

        // WeebGLの初期化(WebGL 2.0)
        gl = canvas.getContext('webgl2');

        // シェーダプログラムの初期化
        // 頂点シェーダ
        var vsSource = [
            '#version 300 es',
            'in vec2 position;',
            'in vec3 color;',
            
            'uniform vec2 vOffset;',
            
            'out vec4 vColor;',

            'void main(void) {',
                'gl_Position = vec4(position + vOffset, 0.0, 1.0);',
                'vColor = vec4(color, 1.0);',
            '}'
        ].join('\n');

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vsSource);
        gl.compileShader(vertexShader);
        if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(vertexShader));
        }

        // フラグメントシェーダ
        var fsSource = [
            '#version 300 es',
            'precision highp float;',
            
            'in vec4 vColor;',
            
            'out vec4 outColor;',

            'void main(void) {',
                'outColor = vColor;',
            '}'
        ].join('\n');

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fsSource);
        gl.compileShader(fragmentShader);
        if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(fragmentShader));
        }

        // シェーダ「プログラム」の初期化
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            alert(gl.getProgramInfoLog(program));
            return;
        }
        
        var uniLocation  = gl.getUniformLocation(program, 'vOffset');
        
        gl.useProgram(program);

        // モデルの構築
        var vertex_positions = new Float32Array([
         // x     y
           0.0, +0.4,
           0.5, -0.4,
          -0.5, -0.4,
        ]);
        const vertexBufferPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPosition);
        gl.bufferData(gl.ARRAY_BUFFER, vertex_positions, gl.STATIC_DRAW);
        var posAttr = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);        // 悪さされないようにバッファを外す
        
        var vertex_colors = new Uint8Array([
         // R    G    B
           255,   0,   0,
             0, 255,   0,
             0,   0, 255,
        ]);
        const vertexBufferColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferColor);
        gl.bufferData(gl.ARRAY_BUFFER, vertex_colors, gl.STATIC_DRAW);
        var colAttr = gl.getAttribLocation(program, 'color');
        gl.enableVertexAttribArray(colAttr);
        gl.vertexAttribPointer(colAttr, 3, gl.UNSIGNED_BYTE, true, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);        // 悪さされないようにバッファを外す
        
        window.requestAnimationFrame(update);
        
        ////////////////////////////
        // フレームの更新
        ////////////////////////////
        var lastTime = null;
        var model_x = 0.0;
        function update(timestamp){
            // 更新間隔の取得
            var elapsedTime = lastTime ? timestamp - lastTime : 0;
            lastTime = timestamp;
            
            ////////////////////////////
            // 動かす
            ////////////////////////////
            
            // モデルの移動
            model_x += 0.001 * elapsedTime; // 0.001は速度の調整
            while(0.5 < model_x) model_x -= 1.0; // -0.5 -> +0.5 を周期的に動く

            ////////////////////////////
            // 描画
            ////////////////////////////
            // 画面クリア
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            // ポリゴンの描画
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPosition);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferColor);
            gl.uniform2f(uniLocation, model_x, 0.0);// 移動量をシェーダに伝える
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
            
            gl.flush();// 画面更新

            // ブラウザに再描画時にアニメーションの更新を要求
            window.requestAnimationFrame(update);
        }
        
    }, false);
})();
