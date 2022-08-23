const isEditor = true;

if (isEditor) {
	paper.install(window);
	//
	// // bind paper to the canvas
	paper.setup('canvas');
}

const automata = new Automata(isEditor);

render();

function render() {
	window.requestAnimationFrame(()=>{
		automata.update();
		render();
	})
}

if (isEditor) {
	view.autoUpdate=false;
	view.pause();
	view.update();
}
