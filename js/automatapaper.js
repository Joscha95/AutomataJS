const isEditor = true;

if (isEditor) {
	paper.install(window);
	//
	// // bind paper to the canvas
	paper.setup('canvas');
}

const automata = new Automata(isEditor,document.body);

automata.onStateChanged=()=>{
	console.log(automata.activeState.name,automata.activeTransition ? automata.activeTransition.name : '');
}

automata.onChanged = () => {
	console.log(true);
}

document.body.append(automata.inspector.domEl);
automata.inspector.domEl.parentNode.style.position='relative';


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

let ex;

fetch('test.json').then( res => res.json()).then( res => ex = JSON.parse(res));

