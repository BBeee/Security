var cubeRotation = 0.0;
var degree = 0;
var hashedData = "";

main();

//var temp = calcSHA1(hashedData);
//alert(hashedData);
//var canvas = document.getElementById('glcanvas');
//var dataURL = canvas.toDataURL("image/png");
//var sha1 = calcSHA1(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
//alert(sha1);
//alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
//document.getElementById("demo").innerHTML = hashedData;


//
// Start here for drawing 3D Cube
//
function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    // If we don't have a GL context, give up now
    
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
    
    // Vertex shader program

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    
    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
    `;
    
    // Fragment shader program
    
    const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
        gl_FragColor = vColor;
    }
    `;
    
    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
    program: shaderProgram,
    attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
    };
    
    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);
    
    var then = 0;
    
    // Draw the scene repeatedly
    
    function render(degree) {
        if(degree < 360){
            degree += 1;
        
            drawScene(gl, programInfo, buffers, degree);
        
            var canvas = document.getElementById('glcanvas');
            var dataURL = canvas.toDataURL("image/png");
            var sha1 = "-------------------";
            sha1 += calcSHA1(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
            hashedData += sha1;
            document.getElementById("demo").innerHTML = hashedData;

            requestAnimationFrame(render);
            
        }
    }
    requestAnimationFrame(render);
    
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {
    
    // Create a buffer for the cube's vertex positions.
    
    const positionBuffer = gl.createBuffer();
    
    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Now create an array of positions for the cube.
    
    const positions = [
                       // Front face
                       -1.0, -1.0,  1.0,
                       1.0, -1.0,  1.0,
                       1.0,  1.0,  1.0,
                       -1.0,  1.0,  1.0,
                       
                       // Back face
                       -1.0, -1.0, -1.0,
                       -1.0,  1.0, -1.0,
                       1.0,  1.0, -1.0,
                       1.0, -1.0, -1.0,
                       
                       // Top face
                       -1.0,  1.0, -1.0,
                       -1.0,  1.0,  1.0,
                       1.0,  1.0,  1.0,
                       1.0,  1.0, -1.0,
                       
                       // Bottom face
                       -1.0, -1.0, -1.0,
                       1.0, -1.0, -1.0,
                       1.0, -1.0,  1.0,
                       -1.0, -1.0,  1.0,
                       
                       // Right face
                       1.0, -1.0, -1.0,
                       1.0,  1.0, -1.0,
                       1.0,  1.0,  1.0,
                       1.0, -1.0,  1.0,
                       
                       // Left face
                       -1.0, -1.0, -1.0,
                       -1.0, -1.0,  1.0,
                       -1.0,  1.0,  1.0,
                       -1.0,  1.0, -1.0,
                       ];
    
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    // Now set up the colors for the faces. We'll use solid colors
    // for each face.
    
    const faceColors = [
                        [1.0,  1.0,  1.0,  1.0],    // Front face: white
                        [1.0,  0.0,  0.0,  1.0],    // Back face: red
                        [0.0,  1.0,  0.0,  1.0],    // Top face: green
                        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
                        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
                        [1.0,  0.0,  1.0,  1.0],    // Left face: purple
                        ];
    
    // Convert the array of colors into a table for all the vertices.
    
    var colors = [];
    
    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    
    const indices = [
                     0,  1,  2,      0,  2,  3,    // front
                     4,  5,  6,      4,  6,  7,    // back
                     8,  9,  10,     8,  10, 11,   // top
                     12, 13, 14,     12, 14, 15,   // bottom
                     16, 17, 18,     16, 18, 19,   // right
                     20, 21, 22,     20, 22, 23,   // left
                     ];
    
    // Now send the element array to GL
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                  new Uint16Array(indices), gl.STATIC_DRAW);
    
    return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    
    // Clear the canvas before we start drawing on it.
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
    
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
    
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [-0.0, 0.0, -6.0]);  // amount to translate
    mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                cubeRotation,     // amount to rotate in radians
                [0, 0, 1]);       // axis to rotate around (Z)
   
    
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
                               programInfo.attribLocations.vertexPosition,
                               numComponents,
                               type,
                               normalize,
                               stride,
                               offset);
        gl.enableVertexAttribArray(
                                   programInfo.attribLocations.vertexPosition);
    }
    
    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
                               programInfo.attribLocations.vertexColor,
                               numComponents,
                               type,
                               normalize,
                               stride,
                               offset);
        gl.enableVertexAttribArray(
                                   programInfo.attribLocations.vertexColor);
    }
    
    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    
    // Tell WebGL to use our program when drawing
    
    gl.useProgram(programInfo.program);
    
    // Set the shader uniforms
    
    gl.uniformMatrix4fv(
                        programInfo.uniformLocations.projectionMatrix,
                        false,
                        projectionMatrix);
    gl.uniformMatrix4fv(
                        programInfo.uniformLocations.modelViewMatrix,
                        false,
                        modelViewMatrix);
    
    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
    
    // Update the rotation for the next draw
    
    cubeRotation = deltaTime;
    //cubeRotation = 1;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    // Create the shader program
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    // If creating the shader program failed, alert
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    
    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    
    // Send the source to the shader object
    
    gl.shaderSource(shader, source);
    
    // Compile the shader program
    
    gl.compileShader(shader);
    
    // See if it compiled successfully
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

var hex_chr = "0123456789abcdef";

function hex(num)
{
    var str = "";
    for(var j = 7; j >= 0; j--)
        str += hex_chr.charAt((num >> (j * 4)) & 0x0F);
    return str;
}

/*
 * Convert a string to a sequence of 16-word blocks, stored as an array.
 * Append padding bits and the length, as described in the SHA1 standard.
 */
function str2blks_SHA1(str)
{
    var nblk = ((str.length + 8) >> 6) + 1;
    var blks = new Array(nblk * 16);
    for(var i = 0; i < nblk * 16; i++) blks[i] = 0;
    for(i = 0; i < str.length; i++)
        blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
    blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
    blks[nblk * 16 - 1] = str.length * 8;
    return blks;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function add(x, y)
{
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left
 */
function rol(num, cnt)
{
    return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function ft(t, b, c, d)
{
    if(t < 20) return (b & c) | ((~b) & d);
    if(t < 40) return b ^ c ^ d;
    if(t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function kt(t)
{
    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
    (t < 60) ? -1894007588 : -899497514;
}

/*
 * Take a string and return the hex representation of its SHA-1.
 */
function calcSHA1(str)
{
    var x = str2blks_SHA1(str);
    var w = new Array(80);
    
    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;
    var e = -1009589776;
    
    for(var i = 0; i < x.length; i += 16)
    {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;
        
        for(var j = 0; j < 80; j++)
        {
            if(j < 16) w[j] = x[i + j];
            else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
            t = add(add(rol(a, 5), ft(j, b, c, d)), add(add(e, w[j]), kt(j)));
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t;
        }
        
        a = add(a, olda);
        b = add(b, oldb);
        c = add(c, oldc);
        d = add(d, oldd);
        e = add(e, olde);
    }
    return hex(a) + hex(b) + hex(c) + hex(d) + hex(e);
}

