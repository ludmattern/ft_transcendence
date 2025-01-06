import { cameraRotationEvent, addCameraRotationListener, toggleFreeView } from '/src/3d/mainScene.js';

const points = document.querySelectorAll(".point");
const compass = document.querySelector(".compass");
const radius = 800;
const baseheight = 5;
const rotationRatio = 0.1;

function positionPoints(offset = 180) {
	const curve = 110 * (1.2 / (window.innerWidth / 3840));
	const totalPoints = points.length;
	
	points.forEach((point, index) => {
		const angle = (index / totalPoints) * Math.PI + offset * (Math.PI / 180);
		const x = radius * Math.cos(angle) + compass.offsetWidth / 2;
		const y = ((curve * Math.sin(angle)) % curve) + curve;
		point.style.left = `${x}px`;
		point.style.top = Math.abs(y + baseheight) + "px";
	});
}

function handleResize() {
	console.log("resize");
	positionPoints();
}

window.addEventListener("resize", handleResize);

function headIsMoving(cameraRotationEvent) {
	console.log("camera orientation y:", cameraRotationEvent);
	const curve = 110 * (1.2 / (window.innerWidth / 3840));
	const percent = (cameraRotationEvent + 1) / 2;
	const offset = percent * 360 * rotationRatio + 180;
	positionPoints(offset);
	console.log("offset", offset);
}

console.log("compass points", points);

addCameraRotationListener(headIsMoving);

positionPoints();

document.getElementById("free-view").addEventListener("click", toggleFreeView);