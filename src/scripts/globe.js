// THREE, OrbitControls, and topojson are loaded globally via CDN in footer.html

// ---------- Basic scene ----------
const container = document.getElementById('app');
if (!container) throw new Error('Globe: #app element not found in DOM');

const scene = new THREE.Scene();

// Loading indicator — sits inside #app, above the THREE.js canvas
const globeLoader = document.createElement('div');
globeLoader.textContent = 'LOADING…';
Object.assign(globeLoader.style, {
  position: 'absolute',
  top: '0', left: '0', right: '0', bottom: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(195, 210, 220, 0.7)',
  fontSize: '0.8rem',
  letterSpacing: '0.12em',
  pointerEvents: 'none',
  zIndex: '10',
});
if (container) container.appendChild(globeLoader);

// Renderer with transparent background
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x000000, 0);
renderer.sortObjects = true;
container.appendChild(renderer.domElement);

// Camera — aspect ratio set properly once ResizeObserver fires
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);
camera.position.set(0, 0, 460);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 60;
controls.maxDistance = 600;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.5;
controls.enableZoom = false;

// Lock vertical rotation: only allow left-right rotation
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Parameters
const RADIUS = 80;
const resolution = 3;

// Material for country borders (front)
const lineMaterial = new THREE.LineBasicMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.2,
	linewidth: 1
});

// Material for back-facing lines
const lineBackMaterial = new THREE.LineBasicMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.2,
	linewidth: 1
});

// Highlight stroke for country borders
const highlightMaterial = new THREE.LineBasicMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.2,
	linewidth: 2
});

// Material for dots on countries
const dotMaterial = new THREE.PointsMaterial({
	color: 0xffffff,
	size: 0.9,
	sizeAttenuation: true,
	transparent: true,
	opacity: 0.25
});

// UAE fill material (lightblue)
const uaeFillMaterial = new THREE.PointsMaterial({
	color: 0x14B8E7,
	size: 2.0,
	sizeAttenuation: true,
	transparent: true,
	opacity: 1.0
});

// ---------- Utility: lat/lon -> 3D on sphere ----------
function latLonToVector3(lat, lon, radius) {
	radius = radius === undefined ? RADIUS : radius;
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lon + 180) * (Math.PI / 180);
	const x = -(radius * Math.sin(phi) * Math.cos(theta));
	const z = (radius * Math.sin(phi) * Math.sin(theta));
	const y = (radius * Math.cos(phi));
	return new THREE.Vector3(x, y, z);
}

// ---------- Add parallels / meridians ----------
function buildLatLonGrid() {
	const gridGroup = new THREE.Group();
	const gridRadius = RADIUS + 4;

	const gridMaterial = new THREE.LineBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0.25,
		linewidth: 1
	});

	// Meridians (longitudes)
	for (let lon = -180; lon <= 180; lon += 15) {
		const points = [];
		for (let lat = -90; lat <= 90; lat += 1 * resolution) {
			points.push(latLonToVector3(lat, lon, gridRadius));
		}
		const geom = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(geom, gridMaterial);
		gridGroup.add(line);
	}

	// Parallels (latitudes)
	for (let lat = -60; lat <= 80; lat += 15) {
		const points = [];
		for (let lon = -180; lon <= 180; lon += 1 * resolution) {
			points.push(latLonToVector3(lat, lon, gridRadius));
		}
		const geom = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(geom, gridMaterial);
		gridGroup.add(line);
	}

	// Equator emphasised
	{
		const points = [];
		for (let lon = -180; lon <= 180; lon += 0.5) points.push(latLonToVector3(0, lon, gridRadius));
		const g = new THREE.BufferGeometry().setFromPoints(points);
		const eq = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 }));
		gridGroup.add(eq);
	}

	gridGroup.renderOrder = 4;
	return gridGroup;
}

const grid = buildLatLonGrid();
scene.add(grid);

// ---------- Load topological world data and draw country outlines ----------
const topoURL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

async function loadAndDrawCountries() {
	try {
		const res = await fetch(topoURL);
		if (!res.ok) throw new Error('TopoJSON fetch failed: ' + res.status);
		const topo = await res.json();

		const geo = topojson.feature(topo, topo.objects.countries);
		const features = geo.features;

		const positionsFront = [];
		const positionsBack = [];
		const dotPositions = [];
		const uaeDots = [];

		for (const feat of features) {
			const geom = feat.geometry;
			const props = feat.properties || {};

			if (
				feat.id === 784 ||
				feat.id === "784" ||
				props.iso_a3 === "ARE" ||
				props.ISO_A3 === "ARE" ||
				props.name === "United Arab Emirates" ||
				props.ADMIN === "United Arab Emirates"
			) {
				if (geom.type === 'Polygon') {
					addCountryDots(geom.coordinates, uaeDots);
				} else if (geom.type === 'MultiPolygon') {
					for (const poly of geom.coordinates) {
						addCountryDots(poly, uaeDots);
					}
				}
				continue;
			}

			if (geom.type === 'Polygon') {
				pushPolygonLine(geom.coordinates, positionsFront, positionsBack);
				addCountryDots(geom.coordinates, dotPositions);
			} else if (geom.type === 'MultiPolygon') {
				for (const poly of geom.coordinates) {
					pushPolygonLine(poly, positionsFront, positionsBack);
					addCountryDots(poly, dotPositions);
				}
			}
		}

		// Front-facing lines
		const positionArrayFront = new Float32Array(positionsFront);
		const bufferGeomFront = new THREE.BufferGeometry();
		bufferGeomFront.setAttribute('position', new THREE.BufferAttribute(positionArrayFront, 3));
		const linesFront = new THREE.LineSegments(bufferGeomFront, lineMaterial);
		linesFront.renderOrder = 2;
		scene.add(linesFront);

		// Back-facing lines
		if (positionsBack.length > 0) {
			const positionArrayBack = new Float32Array(positionsBack);
			const bufferGeomBack = new THREE.BufferGeometry();
			bufferGeomBack.setAttribute('position', new THREE.BufferAttribute(positionArrayBack, 3));
			const linesBack = new THREE.LineSegments(bufferGeomBack, lineBackMaterial);
			linesBack.renderOrder = 1;
			scene.add(linesBack);
		}

		// Country fill dots
		if (dotPositions.length > 0) {
			const dotArray = new Float32Array(dotPositions);
			const dotGeom = new THREE.BufferGeometry();
			dotGeom.setAttribute('position', new THREE.BufferAttribute(dotArray, 3));
			const dots = new THREE.Points(dotGeom, dotMaterial);
			dots.renderOrder = 3;
			scene.add(dots);
		}

		// UAE highlight dots
		if (uaeDots.length > 0) {
			const uaeArr = new Float32Array(uaeDots);
			const uaeGeom = new THREE.BufferGeometry();
			uaeGeom.setAttribute('position', new THREE.BufferAttribute(uaeArr, 3));
			const uaeMesh = new THREE.Points(uaeGeom, uaeFillMaterial);
			uaeMesh.renderOrder = 10;
			scene.add(uaeMesh);
		}

		// Highlighted border stroke (slightly offset outward)
		if (positionsFront.length > 0) {
			const scaleFactor = 1.008;
			const highlightArr = new Float32Array(positionsFront.length);
			for (let i = 0; i < positionsFront.length; i += 3) {
				highlightArr[i]     = positionsFront[i]     * scaleFactor;
				highlightArr[i + 1] = positionsFront[i + 1] * scaleFactor;
				highlightArr[i + 2] = positionsFront[i + 2] * scaleFactor;
			}
			const geoHighlight = new THREE.BufferGeometry();
			geoHighlight.setAttribute('position', new THREE.BufferAttribute(highlightArr, 3));
			const linesHighlight = new THREE.LineSegments(geoHighlight, highlightMaterial);
			linesHighlight.renderOrder = 5;
			scene.add(linesHighlight);
		}

		if (globeLoader) globeLoader.style.display = 'none';

	} catch (err) {
		console.error('Error loading topojson', err);
		if (globeLoader) globeLoader.textContent = 'Map data unavailable';
	}
}

function pushPolygonLine(coordinates, positionsFront, positionsBack) {
	for (const ring of coordinates) {
		for (let i = 0; i < ring.length - 1; i++) {
			const [lon1, lat1] = ring[i];
			const [lon2, lat2] = ring[i + 1];
			const v1 = latLonToVector3(lat1, lon1);
			const v2 = latLonToVector3(lat2, lon2);

			const midpoint = new THREE.Vector3(
				(v1.x + v2.x) / 2,
				(v1.y + v2.y) / 2,
				(v1.z + v2.z) / 2
			);

			if (midpoint.z > 0) {
				positionsFront.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
			} else {
				positionsBack.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
			}
		}
	}
}

function isPointInPolygon(point, ring) {
	const [x, y] = point;
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const [xi, yi] = ring[i];
		const [xj, yj] = ring[j];
		const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
}

function addCountryDots(coordinates, dotPositions) {
	const rings = coordinates;
	if (rings.length === 0) return;

	const outerRing = rings[0];

	let minLon = outerRing[0][0], maxLon = outerRing[0][0];
	let minLat = outerRing[0][1], maxLat = outerRing[0][1];
	for (const [lon, lat] of outerRing) {
		minLon = Math.min(minLon, lon);
		maxLon = Math.max(maxLon, lon);
		minLat = Math.min(minLat, lat);
		maxLat = Math.max(maxLat, lat);
	}

	const gridStep = 0.5;

	for (let lon = minLon; lon <= maxLon; lon += gridStep) {
		for (let lat = minLat; lat <= maxLat; lat += gridStep) {
			const point = [lon, lat];
			if (isPointInPolygon(point, outerRing)) {
				let insideHole = false;
				for (let i = 1; i < rings.length; i++) {
					if (isPointInPolygon(point, rings[i])) {
						insideHole = true;
						break;
					}
				}
				if (!insideHole) {
					const vec = latLonToVector3(lat, lon);
					dotPositions.push(vec.x, vec.y, vec.z);
				}
			}
		}
	}
}

// ---------- Resize handling (also fires on initial layout) ----------
new ResizeObserver(function () {
	const w = container.clientWidth;
	const h = container.clientHeight;
	if (w === 0 || h === 0) return;
	renderer.setSize(w, h);
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}).observe(container);

// ---------- Animation loop ----------
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

// ---------- Kick off ----------
loadAndDrawCountries();
animate();
