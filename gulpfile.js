
const path = require('path');
const gulp = require('gulp');

const fs = require("fs");
const concat = require('gulp-concat');
const size = require('gulp-size');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const through = require('through');
const os = require('os');
const File = gutil.File;
const connect = require('gulp-connect');

let server;

let paths = {
	potree : [
		"src/KeyCodes.js",
		"src/extensions/EventDispatcher.js",
		"src/extensions/PerspectiveCamera.js",
		"src/extensions/OrthographicCamera.js",
		"src/extensions/Ray.js",
		"src/Potree.js",
		"src/PotreeRenderer.js",
		"src/PointCloudTree.js",
		"src/WorkerPool.js",
		"build/shaders/shaders.js",
		"src/loader/POCLoader.js",
		"src/loader/PointAttributes.js",
		"src/loader/BinaryLoader.js",
		"src/loader/GreyhoundBinaryLoader.js",
		"src/loader/GreyhoundLoader.js",
		"src/loader/LasLazLoader.js",
		"src/materials/PointCloudMaterial.js",
		"src/materials/EyeDomeLightingMaterial.js",
		"src/materials/BlurMaterial.js",
		"src/materials/NormalizationMaterial.js",
		"src/materials/NormalizationEDLMaterial.js",
		"src/navigation/InputHandler.js",
		"src/navigation/FirstPersonControls.js",
		"src/navigation/GeoControls.js",
		"src/navigation/OrbitControls.js",
		"src/navigation/EarthControls.js",
		"src/LRU.js",
		"src/Annotation.js",
		"src/Actions.js",
		"src/ProfileRequest.js",
		"src/PointCloudOctree.js",
		"src/PointCloudOctreeGeometry.js",
		"src/PointCloudGreyhoundGeometry.js",
		"src/PointCloudGreyhoundGeometryNode.js",
		"src/utils.js",
		"src/Features.js",
		"src/TextSprite.js",
		"src/AnimationPath.js",
		"src/Version.js",
		"src/utils/Measure.js",
		"src/utils/MeasuringTool.js",
		"src/utils/Profile.js",
		"src/utils/ProfileTool.js",
		"src/utils/TransformationTool.js",
		"src/utils/Volume.js",
		"src/utils/VolumeTool.js",
		"src/utils/ClippingTool.js",
		"src/utils/ScreenBoxSelectTool.js",
		"src/utils/ClipVolume.js",
		"src/utils/PolygonClipVolume.js",
		"src/utils/Box3Helper.js",
		"src/utils/PointCloudSM.js",
		"src/utils/Message.js",
		"src/utils/SpotLightHelper.js",
		"src/exporter/GeoJSONExporter.js",
		"src/exporter/DXFExporter.js",
		"src/exporter/CSVExporter.js",
		"src/exporter/LASExporter.js",
		"src/arena4d/PointCloudArena4D.js",
		"src/arena4d/PointCloudArena4DGeometry.js",
		"src/viewer/PotreeRenderer.js",
		"src/viewer/EDLRenderer.js",
		"src/viewer/HQSplatRenderer.js",
		"src/viewer/RepRenderer.js",
		"src/viewer/View.js",
		"src/viewer/Scene.js",
		"src/viewer/viewer.js",
		"src/viewer/profile.js",
		"src/viewer/map.js",
		"src/viewer/sidebar.js",
		"src/viewer/PropertiesPanel.js",
		"src/viewer/NavigationCube.js",
		"src/stuff/HoverMenu.js",
		"src/webgl/GLProgram.js",
		"src/InterleavedBuffer.js",
		"src/utils/toInterleavedBufferAttribute.js",
		"src/utils/GeoTIFF.js",
	],
	laslaz: [
		"build/workers/laslaz-worker.js",
		"build/workers/lasdecoder-worker.js",
	],
	html: [
		"src/viewer/potree.css",
		"src/viewer/sidebar.html",
		"src/viewer/profile.html"
	],
	resources: [
		"resources/**/*"
	]
};

let workers = {
	"LASLAZWorker": [
		"libs/plasio/workers/laz-perf.js",
		"libs/plasio/workers/laz-loader-worker.js"
	],
	"LASDecoderWorker": [
		"src/workers/LASDecoderWorker.js"
	],
	"BinaryDecoderWorker": [
		"src/workers/BinaryDecoderWorker.js",
		"src/Version.js",
		"src/loader/PointAttributes.js",
		"src/InterleavedBuffer.js",
		"src/utils/toInterleavedBufferAttribute.js",
	],
	"GreyhoundBinaryDecoderWorker": [
		"libs/plasio/workers/laz-perf.js",
		"src/workers/GreyhoundBinaryDecoderWorker.js",
		"src/Version.js",
		"src/loader/PointAttributes.js",
		"src/InterleavedBuffer.js",
		"src/utils/toInterleavedBufferAttribute.js",
	]
};

let shaders = [
	"src/materials/shaders/pointcloud.vs",
	"src/materials/shaders/pointcloud.fs",
	"src/materials/shaders/pointcloud_sm.vs",
	"src/materials/shaders/pointcloud_sm.fs",
	"src/materials/shaders/normalize.vs",
	"src/materials/shaders/normalize.fs",
	"src/materials/shaders/normalize_and_edl.fs",
	"src/materials/shaders/edl.vs",
	"src/materials/shaders/edl.fs",
	"src/materials/shaders/blur.vs",
	"src/materials/shaders/blur.fs"
];


gulp.task("workers", function(){

	for(let workerName of Object.keys(workers)){
		
		gulp.src(workers[workerName])
			.pipe(concat(`${workerName}.js`))
			.pipe(size({showFiles: true}))
			.pipe(gulp.dest('build/potree/workers'));
		
	}

});

gulp.task("shaders", function(){
	return gulp.src(shaders)
		.pipe(encodeShader('shaders.js', "Potree.Shader"))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest('build/shaders'));
});

gulp.task("scripts", ['workers','shaders', "icons_viewer", "examples_page"], function(){
	gulp.src(paths.potree)
		.pipe(concat('potree.js'))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest('build/potree'));

	gulp.src(paths.laslaz)
		.pipe(concat('laslaz.js'))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest('build/potree'));

	gulp.src(paths.html)
		.pipe(gulp.dest('build/potree'));

	gulp.src(paths.resources)
		.pipe(gulp.dest('build/potree/resources'));

	gulp.src(["LICENSE"])
		.pipe(gulp.dest('build/potree'));

	return;
});

gulp.task('build', ['scripts']);

// For development, it is now possible to use 'gulp webserver'
// from the command line to start the server (default port is 8080)
gulp.task('webserver', function() {
	server = connect.server({port: 1234});
});

gulp.task('examples_page', function() {

	let settings = JSON.parse(fs.readFileSync("examples/examples.json", 'utf8'));
	let files = fs.readdirSync("./examples");

	let thumbCode = ``;

	let urls = settings.examples.map(e => e.url);
	let unhandled = [];
	for(let file of files){
		let isHandled = false;
		for(let url of urls){
			
			if(file.indexOf(url) !== -1){
				isHandled = true;
			}
		}

		if(!isHandled){
			unhandled.push(file);
		}
	}

	for(let example of settings.examples){
		thumbCode += `<a href="${example.url}" target="_blank">
			<div class="thumb" style="background-image: url('${example.thumb}'); ">
				<div class="thumb-label">${example.label}</div>
			</div>
		</a>
		`;
	}

	let unhandledCode = ``;
	for(let file of unhandled){
		unhandledCode += `
			<a href="${file}">${file}</a><br>
		`;
	}

	let page = `
		<html>
			<head>
			<style>
			.thumb{
				background-size: 128px 128px; 
				width: 128px; 
				height: 128px; 
				border-radius: 5px; 
				border: 2px solid black; 
				box-shadow: 3px 3px 3px 0px #555; 
				margin: 3px; 
				float: left;
			}

			.thumb-label{
				font-size: large; 
				text-align: center; 
				font-weight: bold; 
				color: #FFF; 
				text-shadow:black 0 0 5px, black 0 0 5px, black 0 0 5px, black 0 0 5px, black 0 0 5px, black 0 0 5px; 
				height: 100%;
			}
			</style>
			</head>
			<body>
				<div id="thumb_container" style="max-width: 1000px; margin: auto; margin-top: 50px;">
					${thumbCode}
				</div>
				<div>
					${unhandledCode}
				</div>
			</body>
		</html>
	`;

	fs.writeFile(`examples/pagetest.html`, page, (err) => {
		if(err){
			console.log(err);
		}else{
			console.log(`examples/pagetest.html`);
		}
	});



});

gulp.task('icons_viewer', function() {
	let iconsPath = "resources/icons";

	fs.readdir(iconsPath, function(err, items) {
		
		let svgs = items.filter(item => item.endsWith(".svg"));
		let other = items.filter(item => !item.endsWith(".svg"));

		items = [...svgs, ...other];
	
		let iconsCode = ``;
		for(let item of items){
			let extension = path.extname(item);
			if(![".png", ".svg", ".jpg", ".jpeg"].includes(extension)){
				continue;
			}

			let iconCode = `
			<span class="icon_container" style="position: relative; float: left">
				<center>
				<img src="${item}" style="height: 32px;"/>
				<div style="font-weight: bold">${item}</div>
				</center>
			</span>
			`;

			//iconsCode += `<img src="${item}" />\n`;
			iconsCode += iconCode;
		}

		let page = `
			<html>
				<head>
					<style>
						.icon_container{
							border: 1px solid black;
							margin: 10px;
							padding: 10px;
						}
					</style>
				</head>
				<body>
					<div id="icons_container">
						${iconsCode}
					</div>
				</body>
			</html>
		`;

		fs.writeFile(`${iconsPath}/index.html`, page, (err) => {
			if(err){
				console.log(err);
			}else{
				console.log(`created ${iconsPath}/index.html`);
			}
		});

	});

});

gulp.task('watch', function() {
	gulp.run("build");
	gulp.run("webserver");
	
	gulp.watch(['src/**/*.js', 'src/**/*.css', 'src/**/*.html', 'src/**/*.vs', 'src/**/*.fs', 'resources/**/*'], ["build"]);
});


let encodeWorker = function(fileName, opt){
	if (!fileName) throw new PluginError('gulp-concat',  'Missing fileName option for gulp-concat');
	if (!opt) opt = {};
	if (!opt.newLine) opt.newLine = gutil.linefeed;

	let buffer = [];
	let firstFile = null;

	function bufferContents(file){
		if (file.isNull()) return; // ignore
		if (file.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

		if (!firstFile) firstFile = file;

		let string = file.contents.toString('utf8');
		buffer.push(string);
	}

	function endStream(){
		if (buffer.length === 0) return this.emit('end');

		let joinedContents = buffer.join("");
		let content = joinedContents;

		let joinedPath = path.join(firstFile.base, fileName);

		let joinedFile = new File({
			cwd: firstFile.cwd,
			base: firstFile.base,
			path: joinedPath,
			contents: new Buffer(content)
		});

		this.emit('data', joinedFile);
		this.emit('end');
	}

	return through(bufferContents, endStream);
};

let encodeShader = function(fileName, varname, opt){
	if (!fileName) throw new PluginError('gulp-concat',  'Missing fileName option for gulp-concat');
	if (!opt) opt = {};
	if (!opt.newLine) opt.newLine = gutil.linefeed;

	let buffer = [];
	let files = [];
	let firstFile = null;

	function bufferContents(file){
		if (file.isNull()) return; // ignore
		if (file.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

		if (!firstFile) firstFile = file;

		let string = file.contents.toString('utf8');
		buffer.push(string);
		files.push(file);
	}

	function endStream(){
		if (buffer.length === 0) return this.emit('end');

		let joinedContent = "";
		for(let i = 0; i < buffer.length; i++){
			let b = buffer[i];
			let file = files[i];

			let fname = file.path.replace(file.base, "");
			console.log(fname);

			let content = new Buffer(b).toString();
			
			let prep = `\nPotree.Shaders["${fname}"] = \`${content}\`\n`;

			joinedContent += prep;
		}

		let joinedPath = path.join(firstFile.base, fileName);

		let joinedFile = new File({
			cwd: firstFile.cwd,
			base: firstFile.base,
			path: joinedPath,
			contents: new Buffer(joinedContent)
		});

		this.emit('data', joinedFile);
		this.emit('end');
	}

	return through(bufferContents, endStream);
};
